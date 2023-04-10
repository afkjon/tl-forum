import { api, type RouterOutputs } from "~/utils/api";

import dayjs from 'dayjs';
import Image from 'next/image'
import Link from 'next/link';

import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const AdminPostView = (props: PostWithUser) => {
  const { user } = useUser();
  const [points, setPoints] = useState(props.post.karma);
  const { post, author } = props;

  if (!post || !author) return null;

  const { mutate: vote, isLoading: isVoting } = api.posts.vote.useMutation({
    onSuccess: (p) => {
      if (!p) return;
      toast.success("Voted!");
      setPoints(p.karma);
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

  const { mutate: deletePost, isLoading: isDeleting } = api.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Deleted!");
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to delete post!");
      }
    },
  });

  const onUpVoteButton = () => {
    if (!user) {
      toast.error("You must be logged in to vote!");
      return;
    }
    vote({ userId: user?.id, postId: post.id, increment: 1 })
  }

  const onDownVoteButton = () => {
    if (!user) {
      toast.error("You must be logged in to vote!");
      return;
    }
    vote({ userId: user?.id, postId: post.id, increment: -1 })
  }

  const onDeleteButton = () => {
    if (!user) {
      toast.error("You must be logged in to delete posts!");
      return;
    }
    deletePost({ postId: post.id })
  }

  return (
    <div className="border-b border-slate-400 p-4 bg-slate-800 w-full flex" key={post.id}>
      {author && author.profileImageUrl && author.username && author.id ? (
        <>
          <Link
            href={`/${author.username}`}>
            <Image
              src={author.profileImageUrl}
              alt={`@${author.username}'s Profile image`}
              className="h-16 w-16 rounded-full gap-3"
              width={56}
              height={56}
            />
          </Link>
          <div className="flex flex-col ml-5">
            <Link href={`/post/${post.id}`} className="underline">
              <h2 className="bold text-lg">{post.title}</h2>
            </Link>
            <div className="flex text-slate-100 ga-1">
              <span className="text-slate-400">
                {` @`}
                <Link
                  href={`/${author.username}`}>
                  {`${author.username}`}
                </Link>
                <span className="text-sm">
                  {` ${dayjs(
                    post.createdAt
                  ).fromNow()}`}
                </span>
              </span>
            </div>
            <span className="mt-3">{post.content}</span>
          </div>
          <div className="block ml-auto text-3xl">
            <div className="flex m-2">
              <button
                className="font-bold"
                onClick={onDownVoteButton}
                disabled={isVoting}
              >-</button>
              <span className="flex text-red-300 font-bold p-2">{points}</span>
              <button
                className="font-bold"
                onClick={onUpVoteButton}
                disabled={isVoting}
              >+</button>
            </div>
            <div>
              <button
                className="bg-red-500 text-white text-lg p-2 px-4 rounded-md"
                onClick={onDeleteButton}
                disabled={isDeleting}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
