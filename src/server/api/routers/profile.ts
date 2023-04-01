import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { filterUserforClient } from "~/server/helpers/filterUserForClient";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User not found.`,
        });
      }

      return filterUserforClient(user);
    }),

  getPostsByUser: publicProcedure
    .input(
      z.object({
        username: z.string().min(1).max(280),
      })
    )
    .query(async ({ ctx, input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User not found.`,
        });
      }
      
      const posts = await ctx.prisma.post.findMany({
        where: {
          authorId: user.id,
        },
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
        }
      });
    }),
});
