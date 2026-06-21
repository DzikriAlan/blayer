import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Navbar from "@/shared/components/general/Navbar";
import Footer from "@/shared/components/general/Footer";

const Contact: NextPage = () => {
  return (
    <>
      <Head>
        <title>Contact - Blayer</title>
        <meta name="description" content="Contact Blayer - Get in touch with us" />
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
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Contact Us</h1>
            <p className="text-slate-400 text-sm mb-10">Have a question, feedback, or collaboration idea? We&apos;d love to hear from you.</p>

            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 ring-1 ring-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-[#C7A56A]/20 flex items-center justify-center">
                    <span className="text-[#C7A56A] font-['Cormorant_Garamond',serif] text-xl font-bold">DA</span>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">Dzikri Alan</h2>
                    <p className="text-slate-500 text-[12px] uppercase tracking-widest font-semibold">Frontend Developer & Creator of Blayer</p>
                  </div>
                </div>
                <p className="text-slate-400 text-[13px] leading-relaxed mb-5">
                  &ldquo;I built Blayer to eliminate the repetitive parts of API integration. If you have feedback, a bug to report, or are interested in collaborating — reach out anytime.&rdquo;
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a href="mailto:dzikripride@gmail.com" className="flex items-center gap-3 bg-slate-800/60 hover:bg-slate-800 border border-white/5 rounded-xl px-4 py-3 transition-all group no-underline">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Email</p>
                      <p className="text-slate-300 text-[12px] font-medium group-hover:text-white transition-colors truncate">dzikripride@gmail.com</p>
                    </div>
                  </a>

                  <a href="https://wa.me/6282123339099" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-slate-800/60 hover:bg-slate-800 border border-white/5 rounded-xl px-4 py-3 transition-all group no-underline">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">WhatsApp</p>
                      <p className="text-slate-300 text-[12px] font-medium group-hover:text-white transition-colors">+62 821 2333 9099</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-6">
                <h3 className="text-white font-bold text-base mb-2">Interested in Collaborating?</h3>
                <p className="text-slate-400 text-[13px] leading-relaxed mb-4">
                  Whether you need a custom integration tool, API consulting, or full-stack development — let&apos;s build something great together.
                </p>
                <a href="https://wa.me/6282123339099" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all no-underline">
                  Start a Conversation
                </a>
              </div>
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

export default Contact;
