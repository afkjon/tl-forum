import Image from "next/image";
import { useUser } from "@clerk/nextjs";

import { LoadingSpinner } from "~/components/loading";

import { api } from "~/utils/api";
import { useState } from "react";


import toast from "react-hot-toast";

export const CreatePostWizard = () => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setContent("");
      void ctx.posts.getAll.invalidate();
      toast.success("Post created!");
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (!user) return null;

  return (
    <>
      <div className="mx-auto border-b border-slate-400">
        <div className="flex w-full gap-3 container p-4">
          <Image src={user.profileImageUrl}
            alt="Profile image"
            className="h-16 w-16 rounded-full"
            width={56}
            height={56}
          />
          <input
            placeholder="Title"
            className="m-2 bg-transparent text-white grow outline-none"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPosting}
          />
        </div>
        <div className="flex w-full container border-t white-border">
          <textarea
            placeholder="Write Post"
            className="bg-transparent text-white grow outline-none m-4 p-4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                mutate({ content: content, title: title })
              }
            }}
            disabled={isPosting}
          />
        </div>
        <div className="flex w-full container border-t white-border">
          {content !== "" && (
            <button
              className= "mx-auto p-3 bg-blue-400 m-3 rounded"
              onClick={() => mutate({ content: content, title: title })}>
              Create Post
            </button>
          )}
          {isPosting && <LoadingSpinner />}
        </div >
      </div>
    </>
  )
}