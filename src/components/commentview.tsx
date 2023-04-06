import { api, type RouterOutputs } from "~/utils/api";

import dayjs from 'dayjs';
import Image from 'next/image'
import Link from 'next/link';

import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
import { useState } from "react";

import { useUser } from "@clerk/nextjs";

dayjs.extend(relativeTime);

type CommentWithUser = RouterOutputs["comments"]["getCommentsForPostId"][number];

export const CommentView = (props: CommentWithUser) => {
  const { user } = useUser();
  const { comment, author } = props;
  const [points, setPoints] = useState(props.comment.karma);

  const { mutate: vote, isLoading: isVoting } = api.comments.vote.useMutation({
    onSuccess: (c) => {
      if (c) {
        toast.success("Voted!");
        setPoints(c.karma)
      }
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to vote! Please try again later.");
      }
    },
  });

  const onUpVoteButton = () => {
    if (!user) {
      toast.error("You must be logged in to vote!");
      return;
    }
    if (user?.id === author.id) return toast.error("You can't vote on your own comment!");

    vote({ userId: user?.id, commentId: comment.id, increment: 1 })
  }

  const onDownVoteButton = () => {
    if (!user) {
      toast.error("You must be logged in to vote!");
      return;
    }
    if (user?.id === author.id) return toast.error("You can't vote on your own comment!");
    vote({ userId: user?.id, commentId: comment.id, increment: -1 })
  }

  return (
    <div className="border border-slate-400 p-4 bg-slate-800 w-full flex" key={comment.id}>
      {author && author.profileImageUrl && author.username && author.id ? (
        <>
          <Image
            src={author.profileImageUrl}
            alt={`@${author.username}'s Profile image`}
            className="h-16 w-16 rounded-full gap-3"
            width={56}
            height={56}
          />
          <div className="flex flex-col ml-5">
            <div className="flex text-slate-100 ga-1">
              <span>
                {` @`}
                <Link
                  className="underline"
                  href={`/${author.username}`}>
                  {`${author.username}`}
                </Link>
              </span>
            </div>
            <span className="font-thin">{` ${dayjs(
              comment.createdAt
            ).fromNow()}`}</span>
            <span className="mt-3">{comment.content}</span>
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
          </div>
        </>
      ) : null}
    </div>
  );
}
