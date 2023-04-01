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

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserforClient);

    return posts.map((post) => {
      const author = users.find(user => user.id === post.authorId);
      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Could not find author for post ${post.id}`,
        });
      }
      return {
        post,
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
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Could not find post for id ${input.id}`,
        });
      }

      const users = (
        await clerkClient.users.getUserList({
          userId: [post.authorId]
        })
      ).map(filterUserforClient);

      const author = users[0];

      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Could not find author for post ${post.id}`,
        });
      }

      return {
        post,
        author: {
          ...author,
          username: author.username,
        }
      };
    }),
  getByCategory: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(280),
      })
    ).query(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.findUnique({
        where: {
          name: input.name,
        },
      });
      const posts = await ctx.prisma.post.findMany({
        where: {
          categoryId: category?.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: posts.map((post) => post.authorId),
          limit: 100,
        })
      ).map(filterUserforClient);

      return posts.map((post) => {
        const author = users.find(user => user.id === post.authorId);
        if (!author) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Could not find author for post ${post.id}`,
          });
        }
        return {
          post,
          author: {
            ...author,
            username: author.username,
          }
        };
      });
    }),
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(280),
      })
    ).query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          OR: [
            {
              title: {
                contains: input.query,
              },
            },
            {
              content: {
                contains: input.query,
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: posts.map((post) => post.authorId),
          limit: 100,
        })
      ).map(filterUserforClient);

      return posts.map((post) => {
        const author = users.find(user => user.id === post.authorId);
        if (!author) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Could not find author for post ${post.id}`,
          });
        }
        return {
          post,
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
        title: z.string().min(1).max(280),
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

      const post = await ctx.prisma.post.create({
        data: {
          title: input.title,
          authorId,
          content: input.content,
          categoryId: "clfvrpvp40000ve405mpzckrd",
        },
      });

      return post;
    }),

  vote: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1).max(280),
        userId: z.string().min(1).max(280),
        increment: z.number().min(-1).max(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are voting too often",
        });
      }

      const userVote = await ctx.prisma.postVote.findFirst({
        where: {
          postId: input.postId,
          userId: input.userId
        },
      });

      if (userVote) {
        // Do nothing if the user is voting the same way
        if (userVote.increment === input.increment) {
          return;
        }
        const post = await ctx.prisma.post.update({
          where: {
            id: input.postId,
          },
          data: {
            karma: {
              increment: input.increment * 2,
            },
          },
        });

        const vote = await ctx.prisma.postVote.update({
          where: {
            id: userVote.id,
          },
          data: {
            increment: input.increment,
          }
        });

        return post;

      } else {
        const post = await ctx.prisma.post.update({
          where: {
            id: input.postId,
          },
          data: {
            karma: {
              increment: input.increment,
            },
          },
        });

        const vote = await ctx.prisma.postVote.create({
          data: {
            postId: input.postId,
            userId: input.userId,
            increment: input.increment,
          },
        });

        return post;
      }
    }),
});
