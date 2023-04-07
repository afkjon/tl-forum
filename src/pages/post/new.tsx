import { type NextPage } from "next";
import { CreatePostWizard } from "~/components/CreatePostWizard";

const NewPost: NextPage = () => {

  return (
    <div className="flex justify-center">
      <div className="h-full w-full border border-slate-400 md:max-w-2xl mt-20">
        <CreatePostWizard />
      </div>
    </div>
  )
}

export default NewPost;