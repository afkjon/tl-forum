import { GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { CreatePostWizard } from "~/components/CreatePostWizard";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { Feed } from "~/components/feed";


const CategoryPage: NextPage<{ category: string }> = ({ category }) => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>translation forums</title>
        <meta name="description" content="I love translation!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#1c0433] to-[#15162c]">
        <div className="fixed">
          <ul>
            <li></li>
          </ul>
        </div>
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div>
                <SignInButton />
              </div>
            )}
            {isSignedIn && <CreatePostWizard />}
            {isSignedIn && <SignOutButton />}
          </div>
          <Feed category={category}></Feed>
        </div>
      </main>
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

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default CategoryPage;
