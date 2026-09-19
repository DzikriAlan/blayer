import type { NextPage } from "next";
import Head from "next/head";
import LandingNav from '@/features/landing/components/LandingNav'
import LandingHero from '@/features/landing/components/LandingHero'
import LandingShowcase from '@/features/landing/components/LandingShowcase'
import LandingCoverage from '@/features/landing/components/LandingCoverage'
import LandingImpact from '@/features/landing/components/LandingImpact'
import LandingEngineering from '@/features/landing/components/LandingEngineering'
import LandingFooter from '@/features/landing/components/LandingFooter'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Blayer — Build excellent AI agents, your way</title>
        <meta name="description" content="Open-source AI agents you self-host. Write a paragraph, get a teammate that answers on your site at 3am and hands off when it should not guess. MIT licensed." />
      </Head>
      <div className="min-h-screen bg-background">
        <LandingNav />
        <LandingHero />
        <LandingShowcase />
        <LandingCoverage />
        <LandingImpact />
        <LandingEngineering />
        <LandingFooter />
      </div>
    </>
  );
};

export default Home;
