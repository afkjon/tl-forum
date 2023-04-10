import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export const CreatePostWizard = () => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [aliases, setAliases] = useState("");
  const [title, setTitle] = useState("");
  const ctx = api.useContext();
  const router = useRouter();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: (data) => {
      setContent("");
      setAliases("");
      setTitle("");
      void ctx.posts.getAll.invalidate();
      toast.success("Post created!");
      void router.push(`/post/${data.id}`);
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

  const handleSubmit = () => {
    mutate({ content, aliases, title })
  }

  const handleKeyEvents = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      mutate({ content, aliases, title })
    }
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
            placeholder="SFX/Word"
            className="m-2 bg-transparent text-white grow outline-none"
            type="text"
            value={title}
            onChange={handleTitleChange}
            disabled={isPosting}
          />
        </div>
        <div className="flex w-full container border-t white-border">
          <input
            placeholder="Alternative Writings (e.g. hiragana, katakana, romaji, etc.)"
            className="m-4 p-4 bg-transparent text-white grow outline-none"
            type="text"
            value={aliases}
            onChange={handleAliasesChange}
            disabled={isPosting}
          />
        </div>
        <div className="flex w-full container border-t white-border">
          <textarea
            placeholder="Definition"
            className="bg-transparent text-white grow outline-none m-4 p-4"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyEvents}
            disabled={isPosting}
          />
        </div>
        <div className="flex w-full container border-t white-border">
          {content !== "" && (
            <button
              className="mx-auto p-3 bg-blue-400 m-3 rounded"
              onClick={handleSubmit}>
              Create Post
            </button>
          )}
          {isPosting && <LoadingSpinner />}
        </div >
      </div>
    </>
  )
}