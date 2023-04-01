import Link from "next/link";
import Image from "next/image"
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const { isSignedIn } = useUser();
  const categories: string[] = ["Onomatopoeia"];
  const [input, setInput] = useState("");

  const router = useRouter();

  const handleSubmit = () => router.push(`/search/${input}`);

  return (
    <div className="flex bg-slate-700 shadow-md z-50 w-full p-2 text-lg  ">
      <div className="max-w-4xl container flex mx-auto">
        <Link href="/">
          <Image
            className="mr-5 invert"
            src="/bubble-chat.png"
            alt="Logo"
            width={40}
            height={40}
          />
        </Link>
        <ul className="flex space-x-3 text-left pt-1">
          {categories?.map((category) => (
            <li className="inline hover:text-red-700" key={category}>
              <Link href={`/category/${category}`}>{category}</Link>
            </li>
          ))}
        </ul>
        <div className="flex items-end text-right ml-auto pl-2 w-1/3">
          <input
            className="border border-slate-400 rounded-md p-1 pl-2 text-black focus:outline-none w-32 md:w-48 lg:w-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleSubmit}
            placeholder="Search"
            type="text"
          />
        </div>
        <div className="p-1 pl-4 pr-4 hover:underline hover:text-red-700 bg-blue-400 rounded drop-shadow-md border-black">
          {isSignedIn ? <SignOutButton /> : <SignInButton />}
        </div>
      </div>
    </div>
  );
}
