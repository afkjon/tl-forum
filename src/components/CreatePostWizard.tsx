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
    <div className="flex w-full gap-3">
      <Image src={user.profileImageUrl}
        alt="Profile image"
        className="h-16 w-16 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Title"
        className="bg-transparent text-white grow outline-none"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isPosting}
      />
      <input
        placeholder="Create Post"
        className="bg-transparent text-white grow outline-none"
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            mutate({ content: content, title: title })
          }
        }}
        disabled={isPosting}
      />
      {content !== "" && (
        <button onClick={() => mutate({ content: content, title: title })}>
          Post
        </button>
      )}
      {isPosting && <LoadingSpinner />}
    </div >
  )
}