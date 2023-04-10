import { api, type RouterOutputs } from "~/utils/api";

import dayjs from 'dayjs';
import Image from 'next/image'
import Link from 'next/link';

import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
import { ChangeEvent, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { user } = useUser();
  const [points, setPoints] = useState(props.post.karma);
  const { post, author } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [aliases, setAliases] = useState(post.aliases);
  const [content, setContent] = useState(post.content);
  const [isDeleted, setIsDeleted] = useState(false);

  if (!post || !author) return null;
  

  const utils = api.useContext();

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

  const { mutate: edit } = api.posts.edit.useMutation({
    onSuccess: (p) => {
      if (!p) return;
      toast.success("Edited!");
      setTitle(p.title);
      setAliases(p.aliases);
      setContent(p.content);
      void utils.posts.get.invalidate({ id: p.id });
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to edit! Please try again later.");
      }
    },
  });

  const { mutate: del } = api.posts.delete.useMutation({
    onSuccess: (p) => {
      if (!p) return;
      toast.success("Deleted!");
      setTitle("");
      setAliases("");
      setContent("(Post Deleted)");
      setIsDeleted(true);
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to delete! Please try again later.");
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

  const handleEditButton = () => {
    if (!user) {
      toast.error("You must be logged in to edit!");
      return;
    }
    setIsEditing(true);
  }

  const handleSaveButton = () => {
    if (!user) {
      toast.error("You must be logged in to edit!");
      return;
    }
    edit({ postId: post.id, title, aliases, content })
    setIsEditing(false);
  }

  const handleDeleteButton = () => {
    if (!user) {
      toast.error("You must be logged in to delete!");
      return;
    }
    del({ postId: post.id })
  }

  const handleTitleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }

  const handleAliasesChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setAliases(e.target.value);
  }

  const handleContentChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }

  if (isDeleted) return null;

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
            {isEditing ?
              <input
                type="text"
                className="bg-slate-700 text-slate-100 p-1 m-1 rounded-sm w-full"
                value={title}
                onChange={handleTitleChange}
              /> :
              <Link href={`/post/${post.id}`} className="underline">
                <h2 className="bold text-lg">{post.title}</h2>
              </Link>}
            {isEditing ?
              <input type="text"
                placeholder="aliases"
                className="bg-slate-700 text-slate-100 p-1 m-1 rounded-sm w-full"
                value={aliases} onChange={handleAliasesChange}
              /> :
              <span className="text-slate-300">{post.aliases}</span>}
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
            {isEditing ?
              <textarea
                className="bg-slate-700 text-slate-100 p-1 m-1 rounded-sm w-full"
                value={content}
                onChange={handleContentChange}
              />
              :
              <span className="mt-3"><ReactMarkdown>{post.content}</ReactMarkdown></span>
            }
          </div>
          {/* Voting Buttons */}
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
            {/* Delete and Edit Buttons */}
            {post.authorId === user?.id ?
              <div className="flex gap-2">
                {isEditing ?
                  <span className="text-sm underline hover:cursor-pointer"
                    onClick={handleSaveButton}>
                    Save
                  </span>
                  :
                  <span className="text-sm underline hover:cursor-pointer"
                    onClick={handleEditButton}>
                    Edit
                  </span>
                }
                <span className="text-sm underline hover:cursor-pointer"
                  onClick={handleDeleteButton}
                >
                  Delete
                </span>
              </div>
              : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
