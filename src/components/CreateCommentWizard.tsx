import Image from "next/image";
import { useUser } from "@clerk/nextjs";

import { LoadingSpinner } from "~/components/loading";

import { api } from "~/utils/api";
import { type FunctionComponent, useState } from "react";

import toast from "react-hot-toast";

type CreateCommentWizardProps = {
  postId: string;
}

export const CreateCommentWizard: FunctionComponent<CreateCommentWizardProps> = ({ postId }: CreateCommentWizardProps) => {
  const { user } = useUser();
  const [comment, setComment] = useState("");
  const ctx = api.useContext();

  const { mutate, isLoading: isCommenting } = api.comments.create.useMutation({
    onSuccess: () => {
      setComment("");
      void ctx.posts.getAll.invalidate();
      toast.success("Comment posted!");
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

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  }

  const handleKeyEvents = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      mutate({ postId, content: comment })
    }
  }

  const handlePostComment = () => {
    mutate({ postId, content: comment })
  }

  return (
    <div className="flex w-full gap-3 p-3 border-slate-400 border-b-2">
      <Image src={user.profileImageUrl}
        alt="Profile image"
        className="h-16 w-16 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Write Comment"
        className="bg-transparent text-white grow outline-none"
        type="text"
        value={comment}
        onChange={handleCommentChange}
        onKeyDown={handleKeyEvents}
        disabled={isCommenting}
      />
      {comment !== "" && (
        <button onClick={handlePostComment}>
          Post
        </button>
      )}
      {isCommenting && <LoadingSpinner />}
    </div >
  )
}