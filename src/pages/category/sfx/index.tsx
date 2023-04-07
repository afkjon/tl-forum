import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useUser } from "@clerk/nextjs";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { Feed } from "~/components/feed";
import NewPostButton from "~/components/newpostbutton";
import SearchByLetter from "~/components/search-by-letter";



const SfxPage: NextPage<{ category: string }> = ({ category }) => {
  const { user, isLoaded: userLoaded } = useUser();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Directory | define!</title>
        <meta name="description" content="I love translation!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#1c0433] to-[#15162c]">
        <div className="flex justify-center">
          <h1 className="text-4xl text-white font-bold mt-10">All Definitions</h1>
        </div>
        <SearchByLetter />
        <div className="flex justify-center">
          <div className="h-full w-full border border-slate-400 md:max-w-2xl mt-20">
            <div className="mx-auto border-slate-400">
              {user ?
                <div className="p-3 mx-auto border-b border-slate-400">
                  <NewPostButton name="New Post" />
                </div> :
                <></>
              }
            </div>
            <Feed category={category}></Feed>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = "sfx"

  if (typeof slug !== "string") throw new Error("Slug is not a string");

  await ssg.posts.getByCategory.prefetch({ name: slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      category: slug,
    }
  };
}

export default SfxPage;
