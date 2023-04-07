import Link from "next/link";
import Image from "next/image"
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import SearchBar from "./searchbar";

export const Navbar = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="flex bg-slate-700 shadow-md z-50 w-full p-2 text-lg">
      <div className="max-w-4xl container flex mx-auto">
        <Link href="/">
          <Image
            className="mr-5 invert"
            src="/static/images/bubble-chat.png"
            alt="Logo"
            width={40}
            height={40}
          />
        </Link>
        <ul className="flex space-x-3 text-left pt-1">
          <li className="inline hover:text-red-700">
            <Link href={`/category/sfx`}>sfx</Link>
          </li>
        </ul>
        <div className="flex lg:items-end lg:text-right sm:ml-10 lg:ml-auto pl-2 w-1/3">
          <SearchBar styles="border grow border-slate-400 rounded-md p-1 pl-2 text-black focus:outline-none w-32 md:w-48 lg:w-50"/>
        </div>
        <div className="p-1 ml-5 px-3 lg:px-4 hover:underline hover:text-red-700 bg-blue-400 rounded drop-shadow-md border-black">
          {isSignedIn ? <SignOutButton /> : <SignInButton />}
        </div>
      </div>
    </div>
  );
}

