import type { NextPage } from "next";
import Head from "next/head";
import LandingHero from '@/features/landing/components/LandingHero'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Chaplin — Your knowledge, always ready</title>
        <meta name="description" content="Turn your team's knowledge into AI agents that answer questions, handle support, and automate workflows — 24/7" />
      </Head>
      <div className="min-h-screen bg-background">
        <LandingHero />
      </div>
    </>
  );
};

export default Home;
