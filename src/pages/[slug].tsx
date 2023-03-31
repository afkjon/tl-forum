import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { LoadingSpinner } from "~/components/loading";

import { api } from "~/utils/api";
import { CreatePostWizard } from "~/components/CreatePostWizard";

const ProfilePage: NextPage<{username: string}> = ({ username }) => {
  const { isSignedIn } = useUser();

  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });
  if (!data) return <div>404</div>;

  console.log(data);

  return (
    <>
      <Head>
        <title>{data.username}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#1c0433] to-[#15162c]">
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
          <div className="flex flex-col items-center justify-center">
            <h1>{data.username}</h1>
          </div>
        </div>
      </main>
    </>
  );
};

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";

export const getStaticProps: GetStaticProps = async (context ) => {
  const ssg = createProxySSGHelpers({
    router: appRouter, 
    ctx: { prisma , userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("Slug is not a string");

  await ssg.profile.getUserByUsername.prefetch({ username: slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username: slug,
    }
  };
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;

export const LoadingPage = () => {
  return (
    <div className="absolute top-0 right-0 flex h-screen w-screen justify-center align-middle">
      <LoadingSpinner />
    </div>
  );
}

export const ErrorPage = () => {
  return (
    <div>Something went wrong</div>
  );
}