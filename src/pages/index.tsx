import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Feed } from "~/components/feed";

const Home: NextPage = () => {
  const postFeedCategory = "Unorganized";

  const { isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>translation forums</title>
        <meta name="description" content="I love translation!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen justify-center bg-gradient-to-b from-[#1c0433] to-[#15162c]">
        <div className="h-full w-full border border-slate-400 md:max-w-2xl mt-20">
          
          <Feed category={postFeedCategory} />
        </div>
      </div>
    </>
  );
};

export default Home;

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";

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
