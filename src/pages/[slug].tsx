import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const router = useRouter();
  const { data: userData } = api.profile.getUserByUsername.useQuery({
    username,
  });

  const { data: posts } = api.profile.getPostsByUser.useQuery({
    username,
  });

  if (!userData?.username) {
    router.push("/404", undefined, { shallow: true });
    return null;
  }

  return (
    <>
      {userData?.username && userData?.profileImageUrl ? (
        <>
          <Head>
            <title>{userData.username}</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#1c0433] to-[#15162c]">
            <div className="h-full w-full border border-slate-400 md:max-w-2xl border-t-0">
              <div className="grid">
                <Image
                  className="rounded-full m-4 border-slate-400 border-1"
                  alt={`${userData.username}'s profile picture`}
                  src={userData.profileImageUrl}
                  width={100}
                  height={100}
                />
              </div>
              <div className="flex flex-col p-5">
                <div className="font-bold text-lg">{userData.username}</div>
                <div className="text-md text-slate-300">@{userData.username}</div>
                <p className="mt-4">
                  Lorep ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  tincidunt, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec
                  lacinia nisl nisl sit amet nisl. Sed tincidunt, nisl nec ultricies
                  lacinia, nisl nisl aliquam nisl, nec lacinia nisl nisl sit amet
                </p>
              </div>

              <div className="flex flex-col">
                {(!posts || posts.length === 0) ?
                  posts?.map((fullPost) => (
                    <PostView {...fullPost} key={fullPost.post.id} />
                  ))
                  : <div>User has no posts yet!</div>}
              </div>
            </div>
          </main>
        </>) : null
      }
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

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
