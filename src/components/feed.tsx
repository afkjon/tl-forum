import { FunctionComponent } from "react";
import { api } from "~/utils/api";
import { ErrorPage } from "./error-page";
import { LoadingPage } from "./loading-page";
import { PostView } from "./postview";

type FeedProps = {
  category: string;
}

export const Feed: FunctionComponent<FeedProps> = ({category} : FeedProps) => {
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
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )
}
