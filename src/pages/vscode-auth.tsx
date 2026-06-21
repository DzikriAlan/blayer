import type { NextPage } from "next";
import Head from "next/head";

const VSCodeAuth: NextPage = () => {
  return (
    <>
      <Head>
        <title>Connecting to VS Code - Blayer</title>
      </Head>
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <span className="text-[#C7A56A] font-['JetBrains_Mono',monospace] text-sm tracking-widest uppercase">Connecting to VS Code...</span>
      </div>
    </>
  );
};

export default VSCodeAuth;
