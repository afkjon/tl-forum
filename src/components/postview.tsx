import { api, RouterOutputs } from "~/utils/api";

import dayjs from 'dayjs';
import Image from 'next/image'
import Link from 'next/link';

import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  const { mutate: vote, isLoading: isUpVoting } = api.posts.vote.useMutation({
    onSuccess: () => {
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to upvote! Please try again later.");
      }
    },
  });

  const onUpVoteButton = () => {
    vote({ id: post.id, increment: 1 });
  }

  const onDownVoteButton = () => {
    vote({ id: post.id, increment: -1 });
  }

  return (
    <div className="border-b border-slate-400 p-4 bg-slate-800" key={post.id}>
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}'s Profile image`}
        className="h-16 w-16 rounded-full gap-3"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex justify-start">
          <button className="font-bold" onClick={onDownVoteButton}>-</button>
          <span className="flex text-red-300 font-bold underline p-2">{post.karma}</span>
          <button className="font-bold" onClick={onUpVoteButton}>+</button>
        </div>
        <h2>{post.title}</h2>
        <div className="flex text-slate-100 ga-1">
          <span>
            Submitted by {` @`}
            <Link
              className="underline"
              href={`/${author.username}`}>
              {`${author.username}`}
            </Link>
          </span>
        </div>
        <Link href={`/post/${post.id}`} className="underline">
          <span className="font-thin">{` ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </Link>

        <span>{post.content}</span>
      </div>
    </div>
  );
}
