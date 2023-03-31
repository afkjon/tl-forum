import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { LoadingSpinner } from "~/components/loading";

import { api } from "~/utils/api";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  const { data: posts, isLoading } = api.profile.getPostsByUser.useQuery({
    username,
  });

  if (!data || !posts) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#1c0433] to-[#15162c]">
        <div className="h-full w-full border border-slate-400 md:max-w-2xl border-t-0">
          <div className="grid">
            <Image
              className="rounded-full m-4 border-slate-400 border-1"
              alt={`${data.username}'s profile picture`}
              src={data.profileImageUrl}
              width={100}
              height={100}
            />
          </div>
          <div className="flex flex-col p-5">
            <div className="font-bold text-lg">{data.username}</div>
            <div className="text-md text-slate-300">@{data.username}</div>
            <p className="mt-4">
              Lorep ipsum dolor sit amet, consectetur adipiscing elit. Sed
              tincidunt, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec
              lacinia nisl nisl sit amet nisl. Sed tincidunt, nisl nec ultricies
              lacinia, nisl nisl aliquam nisl, nec lacinia nisl nisl sit amet
            </p>
          </div>
          
          <div className="flex flex-col">
            {posts.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
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
import { PostView } from "~/components/postview";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("Slug is not a string");

  await ssg.profile.getUserByUsername.prefetch({ username: slug });
  await ssg.profile.getPostsByUser.prefetch({ username: slug });

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