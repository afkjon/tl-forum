import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { filterUserforClient } from "~/server/helpers/filterUserForClient";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiter allows 3 requests per 1 minute
const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true
})

export const commentsRouter = createTRPCRouter({
  getCommentsForPostId: publicProcedure
    .input(
      z.object({
        postId: z.string().min(1).max(280),
      })
    ).query(async ({ ctx, input }) => {

      const comments = await ctx.prisma.comment.findMany({
        take: 10,
        where: {
          postId: input.postId
        },
        orderBy: {
          karma: "desc",
        },
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: comments.map((comment) => comment.authorId),
          limit: 100,
        })
      ).map(filterUserforClient);

      return comments.map((comment) => {
        const author = users.find(user => user.id === comment.authorId);
        if (!author) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Could not find author for post ${comment.id}`,
          });
        }
        return {
          comment,
          author: {
            ...author,
            username: author.username,
          }
        };
      });
    }),
  get: publicProcedure
    .input(
      z.object({
        id: z.string().min(1).max(280),
      })
    )
    .query(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!comment) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Could not find post for id ${input.id}`,
        });
      }

      const users = (
        await clerkClient.users.getUserList({
          userId: [comment.authorId]
        })
      ).map(filterUserforClient);

      const author = users[0];

      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Could not find author for post ${comment.id}`,
        });
      }

      return {
        comment,
        author: {
          ...author,
          username: author.username,
        }
      };
    }),
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(280),
      })
    ).query(async ({ ctx, input }) => {
      const comments = await ctx.prisma.comment.findMany({
        where: {
          content: {
            contains: input.query,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: comments.map((comment) => comment.authorId),
          limit: 100,
        })
      ).map(filterUserforClient);

      return comments.map((comment) => {
        const author = users.find(user => user.id === comment.authorId);
        if (!author) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Could not find author for post ${comment.id}`,
          });
        }
        return {
          comment,
          author: {
            ...author,
            username: author.username,
          }
        }
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1).max(280),
        content: z.string().min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are posting too fast",
        });
      }

      const comment = await ctx.prisma.comment.create({
        data: {
          authorId,
          content: input.content,
          postId: input.postId
        },
      });

      return comment;
    }),

  vote: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1).max(280),
        commentId: z.string().min(1).max(280),
        increment: z.number().min(-1).max(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are voting too fast",
        });
      }
      
      const userVote = await ctx.prisma.commentVote.findFirst({
        where: {
          commentId: input.commentId,
          userId: input.userId
        },
      });

      if (userVote) {
        // Do nothing if the user is voting the same way
        if (userVote.increment === input.increment) {
          return;
        }
        const comment = await ctx.prisma.comment.update({
          where: {
            id: input.commentId,
          },
          data: {
            karma: {
              increment: input.increment * 2,
            },
          },
        });

        const vote = await ctx.prisma.commentVote.update({
          where: {
            id: userVote.id,
          },
          data: {
            increment: input.increment,
          }
        });

        return comment;

      } else {
        const comment = await ctx.prisma.comment.update({
          where: {
            id: input.commentId,
          },
          data: {
            karma: {
              increment: input.increment,
            },
          },
        });

        const vote = await ctx.prisma.commentVote.create({
          data: {
            commentId: input.commentId,
            userId: input.userId,
            increment: input.increment,
          },
        });

        return comment;
      }
    }),
});
