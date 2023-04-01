import Link from "next/link";
import Image from "next/image"
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignOutButton } from "@clerk/nextjs";


const Icon = () => {
  return (
    <svg fill="#000000" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M14.12 4 8.62.85a1.28 1.28 0 0 0-1.24 0L1.88 4a1.25 1.25 0 0 0-.63 1.09V11a1.25 1.25 0 0 0 .63 1l5.5 3.11a1.28 1.28 0 0 0 1.24 0l5.5-3.11a1.25 1.25 0 0 0 .63-1V5.05A1.25 1.25 0 0 0 14.12 4zm-6.74 9.71-2.13-1.2v-5.3l2.13 1.16zM8 7.29 5.92 6.15l4.81-2.67 2.09 1.18zm0-5.35 1.46.82-4.84 2.69-1.44-.79zM2.5 5.71l1.5.82v5.27L2.5 11zm6.12 8V8.37l4.88-2.66V11z"></path></g>
    </svg>
  );
}

export const Navbar = () => {
  const { isSignedIn } = useUser();
  const categories: string[] = ["Onomatopoeia"];
  const [input, setInput] = useState("");

  const { push } = useRouter();

  const handleSubmit = () => {
    push(`/search/${input}`);
  }

  return (
    <div className="flex bg-slate-700 shadow-md z-50 w-full p-2 text-lg  ">
      <div className="max-w-4xl container flex mx-auto">
        <Link href="/">
          <Image
            className="mr-5"
            src="/bubble-chat.png"
            alt="Logo"
            width={40}
            height={40}
          />
        </Link>
        <ul className="flex space-x-3 text-left pt-1">
          {categories?.map((category) => (
            <li className="inline hover:text-red-700"><Link href={`/category/${category}`}>{category}</Link></li>
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
