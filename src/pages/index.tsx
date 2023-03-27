import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { LoadingSpinner } from "~/components/loading";

import { api, RouterOutputs } from "~/utils/api";
import { useState } from "react";

import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Link from "next/link";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      ctx.posts.getAll.invalidate();
    }
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image src={user.profileImageUrl}
        alt="Profile image"
        className="h-16 w-16 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type something"
        className="bg-transparent text-white grow outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            mutate({ content: input })
          }
        }}
        disabled={isPosting}
      />
      <button onClick={() => mutate({ content: input })}>Post</button>
    </div >
  )
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div className="border-b border-slate-400 p-4" key={post.id}>
      <Image
        src={author.profileImageUrl}
        alt="Profile image"
        className="h-16 w-16 rounded-full gap-3"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-100">
          <span>{`@${author.username!}`}</span>
        </div>
        <Link href={`/post/${post.id}`}>
          <span className="font-thin">{` ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </Link>
        <span>{post.content}</span>
      </div>
    </div>
  );
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading)
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );

  if (!data) return <ErrorPage />;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )
}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
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
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;

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