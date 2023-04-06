
import { useRouter } from "next/router";

type NewPostProps = {
  name: string;
}

const NewPostButton = (props : NewPostProps) => {

  const router = useRouter();
  const handleNewPost = () => {
    void router.push('/post/new');
  }

  return (
    <button
      className="bg-blue-400 rounded p-2 px-3"
      onClick={handleNewPost}
    >
      {props.name}
    </button>
  )
}

export default NewPostButton