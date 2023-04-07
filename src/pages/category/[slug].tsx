import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useUser } from "@clerk/nextjs";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { Feed } from "~/components/feed";


const CategoryPage: NextPage<{ category: string }> = ({ category }) => {
  const { isLoaded: userLoaded } = useUser();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>sfx translation forums</title>
        <meta name="description" content="I love translation!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex justify-center">
        <div className="h-full w-full border border-slate-400 md:max-w-2xl mt-20">
          <Feed category={category}></Feed>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("Slug is not a string");

  await ssg.posts.getByCategory.prefetch({ name: slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      category: slug,
    }
  };
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default CategoryPage;
