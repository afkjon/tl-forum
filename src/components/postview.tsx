import type { RouterOutputs } from "~/utils/api";

import dayjs from 'dayjs';
import Image from 'next/image'
import Link from 'next/link';

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div className="border-b border-slate-400 p-4" key={post.id}>
      <Image
        src={author.profileImageUrl}
        alt={`@${author.id}'s Profile image`}
        className="h-16 w-16 rounded-full gap-3"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-100">
          <span>{`@${author.id} `}</span>
        </div>
        <Link href={`/post/${post.id}`}>
          <span className="font-thin">{` ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </Link>
        <span>{post.content}</span>
      </div>
    </div>
  );
}
