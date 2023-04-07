import type { NextPage } from "next";
import Head from "next/head";
import SearchBar from "~/components/searchbar";

const SearchPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>define! - Search</title>
        <meta name="description" content="I love translation!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-[#1c0433] to-[#15162c]">
        <div className="flex justify-center">
          <h1 className="text-4xl text-white font-bold mt-10">Search</h1>
        </div>
        <div className="flex justify-center">
          <div className="h-full w-full md:max-w-2xl mt-20">
            <p className="m-3 text-center">Type your query and press Enter!</p>
            <SearchBar styles="border grow border-slate-400 rounded-md p-1 pl-2 text-black focus:outline-none w-full" />
          </div>
        </div>
      </div>
    </>
  )
}


export default SearchPage;
