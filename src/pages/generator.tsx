import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Footer from "@/shared/components/general/Footer";
import GeneratorPageContent from "@/features/generator/components/GeneratorPageContent";

const Generator: NextPage = () => {
  return (
    <>
      <Head>
        <title>Blayer - API Integration Code Generator</title>
        <meta name="description" content="API Integration Code Generator" />
      </Head>
      <div className="min-h-screen w-full flex flex-col font-sans text-slate-100 overflow-x-hidden bg-[#020617] relative z-0">
        {/* Background Effects */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-purple-600/10 blur-[130px] rounded-full"></div>
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617]/50"></div>
        </div>

        <GeneratorPageContent />
        <Footer />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

export default Generator;
