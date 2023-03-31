import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignOutButton } from "@clerk/nextjs";

export const Navbar = () => {
  const { isSignedIn } = useUser();
  const categories : string[] = ["Unorganized", "Onomatopoeia", "Request"];
  const [input, setInput] = useState("");

  const { push } = useRouter();

  const handleSubmit = () => {
    push(`/search/${input}`);
  }

  return (
    <div className="flex bg-slate-700 shadow-md z-50 w-full p-2 text-lg  ">
      <div className="max-w-4xl container flex mx-auto">
        <ul className="flex space-x-3 text-left pt-1">
          {categories?.map((category) => (
            <li className="inline hover:text-red-700"><Link href={`/category/${category}`}>{category}</Link></li>
          ))}
        </ul>
        <div className="flex items-end text-right pl-10">
          <input
            className="border border-slate-400 rounded-md p-1 pl-2 ml-auto text-black focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleSubmit}
            placeholder="Search"
          />
        </div>
        <div className="p-1 pl-4 hover:underline hover:text-red-700">
          {isSignedIn ? <SignOutButton /> : <SignInButton />}
        </div>
      </div>
    </div>
  );
}
