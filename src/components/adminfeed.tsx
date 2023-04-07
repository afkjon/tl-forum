import type { FunctionComponent } from "react";
import { api } from "~/utils/api";
import { ErrorPage } from "./error-page";
import { LoadingPage } from "./loading-page";
import { AdminPostView } from "./adminpostview";

type AdminFeedProps = {
  category: string;
}

export const AdminFeed: FunctionComponent<AdminFeedProps> = ({ category }: AdminFeedProps) => {
  const { data, isLoading: postsLoading } = api.posts.getByCategory.useQuery({ name: category });

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
        <>
          <AdminPostView {...fullPost} key={fullPost.post.id} />
        </>
      ))}
    </div>
  )
}
