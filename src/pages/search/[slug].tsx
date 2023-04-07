import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { SignOutButton, useUser } from "@clerk/nextjs";

import { CreatePostWizard } from "~/components/CreatePostWizard";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import type { FunctionComponent } from "react";
import { api } from "~/utils/api";
import { PostView } from "~/components/postview";
import { LoadingPage } from "~/components/loading-page";

type SearchResultsProps = {
  query: string;
}

export const SearchResults: FunctionComponent<SearchResultsProps> = ({ query }: SearchResultsProps) => {
  const { data, isLoading: postsLoading } = api.posts.search.useQuery({ query });

  if (postsLoading)
    return (
      <LoadingPage />
    );

  if (!data?.at(0)) return (
    <div className="flex justify-center m-3">
      <div className="text-2xl">No Results</div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )
}


const SearchPage: NextPage<{ query: string }> = ({ query }) => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>translation forums</title>
        <meta name="description" content="I love translation!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        <div className="flex border-b border-slate-400 p-4">
          {isSignedIn && <CreatePostWizard />}
          {isSignedIn && <SignOutButton />}
        </div>
        <SearchResults query={query}></SearchResults>
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
      query: slug,
    }
  };
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SearchPage;
