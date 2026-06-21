import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Next Starter</title>
        <meta name="description" content="Next Starter" />
      </Head>
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="text-4xl font-bold">Next Starter</h1>
      </main>
    </>
  );
};

export default Home;
