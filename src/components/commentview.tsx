import { api, RouterOutputs } from "~/utils/api";

import dayjs from 'dayjs';
import Image from 'next/image'
import Link from 'next/link';

import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
import { useState } from "react";
dayjs.extend(relativeTime);

type CommentWithUser = RouterOutputs["comments"]["getCommentsForPostId"][number];

export const CommentView = (props: CommentWithUser) => {
  const { comment, author } = props;
  const [points, setPoints] = useState(props.comment.karma);

  const { mutate: vote, isLoading: isVoting } = api.comments.vote.useMutation({
    onSuccess: (c) => {
      toast.success("Voted!");
      setPoints(c.karma)
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
    vote({ id: comment.id, increment: 1 })
  }

  const onDownVoteButton = () => {
    vote({ id: comment.id, increment: -1 });
  }

  return (
    <div className="border border-slate-400 p-4 bg-slate-800 w-full flex" key={comment.id}>
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
    </div>
  );
}

export const getServerSideProps = async (ctx: any) => {
  const { postId } = ctx.query;
  const { data } = await ctx.comments.getCommentsForPostId(postId).prefetch();
  return {
    props: {
      comments: data,
    },
  };
}

