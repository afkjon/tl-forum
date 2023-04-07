import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: bioData } = api.profile.getBiographyByUsername.useQuery({
    username,
  });
  const [biography, setBiography] = useState(bioData?.content || "");

  const { user } = useUser();
  const ctx = api.useContext();

  const { data: userData } = api.profile.getUserByUsername.useQuery({
    username,
  });

  const { data: posts } = api.profile.getPostsByUser.useQuery({
    username,
  });

  if (!userData?.username) {
    return null;
  }

  const { mutate, isLoading: isUpdating } =
    api.profile.editBiography.useMutation({
      onSuccess: (data) => {
        void ctx.profile.getBiographyByUsername.invalidate();
        toast.success("Biography Updated!");
        setBiography(data.content);
      },
      onError: (err) => {
        const errorMessage = err.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to update biography! Please try again later.");
        }
      },
    });

  const handleSubmitEdit = () => {
    setIsEditing(!isEditing)
    if (biography === "") return;
    mutate({
      content: biography,
      username,
    });
  }

  return (
    <>
      {userData?.username && userData?.profileImageUrl ? (
        <>
          <Head>
            <title>{userData.username}</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className="flex justify-center">
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

                {user && isEditing ?
                  <textarea
                    className="mt-4 p-4 text-black"
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        handleSubmitEdit();
                      }
                    }}
                    disabled={isUpdating}
                  />
                  :
                  <div className="mt-4">
                    <ReactMarkdown>{biography}</ReactMarkdown>
                  </div>
                }

              </div>
              <div className="flex justify-center">
                {user && user.username === userData.username && !isEditing ?
                  <button
                    className="m-4 bg-blue-600 rounded-md p-2 px-4 text-white"
                    onClick={() => {
                      setIsEditing(!isEditing);
                    }}
                  >Edit Biography</button>
                  : null}
              </div>


              <div className="flex flex-col">
                {(!posts || posts.length !== 0) ?
                  posts?.map((fullPost) => (
                    <PostView {...fullPost} key={fullPost.post.id} />
                  ))

                  : <div className="mx-auto p-3">User has no posts yet!</div>}
              </div>
            </div>
          </div>
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
import { useState } from "react";
import toast from "react-hot-toast";

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
  await ssg.profile.getBiographyByUsername.prefetch({ username: slug });

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
