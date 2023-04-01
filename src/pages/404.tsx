import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Custom404 : NextPage = () => {
  return (
    <>
      <Head>
        <title>404</title>
        <meta name="description" content="I love translation!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto max-w-lg p-10 text-xl">
        Nothing is here. <br />
        Return to the <Link href="/" className="underline hover:text-red-500">homepage</Link>
      </div>
    </>
  );
}

export default Custom404;