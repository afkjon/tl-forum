
import Head from "next/head";
import { type NextPage } from "next";
import { AdminFeed } from "~/components/adminfeed";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import NewPostButton from "~/components/newpostbutton";

import { useOrganizationList, useUser } from "@clerk/nextjs";
import { ErrorPage } from "~/components/error-page";


const AdminPage: NextPage = () => {
  const { user } = useUser();
  const { organizationList } = useOrganizationList();
  
  if (!user) return <ErrorPage />;

  const isAdmin = organizationList?.at(0)?.membership.role === "admin";

  if (!isAdmin) return <ErrorPage />;

  const postFeedCategory = "Unorganized";

  return (
    <>
      <Head>
        <title>define! - Admin Panel</title>
        <meta name="description" content="I love translation!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex justify-center">
        <h1 className="text-4xl text-white font-bold mt-10">Latest Definitions</h1>
      </div>
      <div className="flex justify-center mt-5">
        <NewPostButton name="Submit a Definition" />
      </div>
      <div className="flex justify-center">

        <div className="h-full w-full border border-slate-400 md:max-w-2xl mt-20">
          <AdminFeed category={postFeedCategory} />
        </div>
      </div>
    </>
  );
};

export default AdminPage;

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
