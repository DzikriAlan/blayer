import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Navbar from "@/shared/components/general/Navbar";
import Footer from "@/shared/components/general/Footer";

const PrivacyPolicy: NextPage = () => {
  const sections = [
    { title: "1. Introduction", content: 'Welcome to <strong class="text-indigo-400">Blayer</strong>. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our service at blayer.app (the "Service").' },
    { title: "2. Information We Collect", content: 'We may collect: <strong class="text-slate-300">Usage Data</strong> (pages visited, browser type, IP), <strong class="text-slate-300">Cookies</strong> (small data files), and <strong class="text-slate-300">Local Storage</strong> (API endpoint data is stored locally and never transmitted to our servers).' },
    { title: "3. Cookies and Tracking Technologies", content: 'We use cookies for: strictly necessary functionality, preference remembering, analytics (understanding visitor interaction), and advertising (Google AdSense). You can instruct your browser to refuse cookies.' },
    { title: "4. Google AdSense and Third-Party Advertising", content: 'We use Google AdSense to display advertisements. Google uses cookies to serve ads based on prior visits. You may opt out at <a href="https://www.google.com/settings/ads" target="_blank" class="text-indigo-400 hover:underline">Google Ads Settings</a>.' },
    { title: "5. How We Use Your Information", content: 'To provide and maintain our Service, improve and personalize it, understand usage patterns, display relevant ads, and comply with legal obligations.' },
    { title: "6. Data Sharing and Disclosure", content: 'We do not sell your personal information. We may share data with Google (analytics/ads) and legal authorities when required by law.' },
    { title: "7. Data Security", content: 'We implement appropriate technical measures to protect your data. However, no method of Internet transmission is 100% secure.' },
    { title: "8. Your Rights", content: 'You may have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:dzikripride@gmail.com" class="text-indigo-400 hover:underline">dzikripride@gmail.com</a>.' },
    { title: "9. Changes to This Policy", content: 'We may update this policy. Changes will be posted with an updated "Last updated" date.' },
    { title: "10. Contact Us", content: 'Questions? Contact us at <a href="mailto:dzikripride@gmail.com" class="text-indigo-400 hover:underline">dzikripride@gmail.com</a>.' },
  ];

  return (
    <>
      <Head>
        <title>Privacy Policy - Blayer</title>
        <meta name="description" content="Privacy Policy for Blayer - API Integration Code Generator" />
      </Head>
      <div className="min-h-screen w-full flex flex-col text-[#F5F1EA] bg-[#020617]">
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-purple-600/10 blur-[130px] rounded-full"></div>
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <Navbar />
        <div className="h-16 shrink-0"></div>

        <main className="flex-1 relative z-10 py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Privacy Policy</h1>
            <p className="text-slate-500 text-sm mb-10">Last updated: April 25, 2026</p>

            <div className="space-y-8 text-slate-300 text-[14px] leading-relaxed">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                  <p dangerouslySetInnerHTML={{ __html: section.content }} />
                </section>
              ))}
            </div>
          </div>
        </main>

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

export default PrivacyPolicy;
