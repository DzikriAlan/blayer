import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import TestRequestPanel from "@/features/test-request/components/TestRequestPanel";

const TestRequest: NextPage = () => {
  return (
    <>
      <Head>
        <title>Test Request - Blayer</title>
        <meta name="description" content="API testing client - test your endpoints directly" />
        <style>{`
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #333333; border-radius: 2px; }
          ::-webkit-scrollbar-thumb:hover { background: #585858; }
          option { background: #232323; color: #E2E2E2; }
        `}</style>
      </Head>
      <TestRequestPanel />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
});

export default TestRequest;
