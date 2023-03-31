import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { LoadingSpinner } from "~/components/loading";

import { api } from "~/utils/api";

import { PostView } from "~/components/postview";
import { CreatePostWizard } from "~/components/CreatePostWizard";

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
        <title>translation forums</title>
        <meta name="description" content="I love translation!" />
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