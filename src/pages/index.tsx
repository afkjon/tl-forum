
import Head from "next/head";
import { type NextPage } from "next";
import { Feed } from "~/components/feed";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";


const Home: NextPage = () => {
  const postFeedCategory = "Unorganized";

  return (
    <>
      <Head>
        <title>define! - Latest Definitions</title>
        <meta name="description" content="I love translation!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-[#1c0433] to-[#15162c]">
        <div className="flex justify-center ">
          <h1 className="text-4xl text-white font-bold mt-10">Latest Definitions</h1>
        </div>
        <div className="flex justify-center">
          <div className="h-full w-full border border-slate-400 md:max-w-2xl mt-20">
            <Feed category={postFeedCategory} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

export const getStaticProps = async () => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  await ssg.categories.getAll.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    }
  };
}
