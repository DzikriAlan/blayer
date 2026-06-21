import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Navbar from "@/shared/components/general/Navbar";
import LandingHeroSection from "@/features/landing/components/LandingHeroSection";
import LandingDesignSystems from "@/features/landing/components/LandingDesignSystems";
import LandingCTASection from "@/features/landing/components/LandingCTASection";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Blayer</title>
        <meta name="description" content="Blayer - API code generation for your project" />
      </Head>
      <div className="min-h-screen w-full flex flex-col font-sans text-slate-100 overflow-x-hidden bg-midnight relative z-0">
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-navy/20 blur-[140px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-navy-900/30 blur-[130px] rounded-full"></div>
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full"></div>
        </div>
        <Navbar />
        <div className="pt-28">
        <LandingHeroSection />
        <LandingDesignSystems />
        <LandingCTASection />
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

export default Home;
