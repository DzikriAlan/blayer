import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Profile: NextPage = () => {
  return (
    <>
      <Head>
        <title>Profile - Blayer</title>
      </Head>
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="glass-panel border-refined rounded-2xl p-8 max-w-sm w-full">
          <div className="flex flex-col items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#C7A56A]/10 border-2 border-[#C7A56A]/30 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C7A56A" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>

            {/* Info */}
            <div className="text-center">
              <h2 className="text-[#F5F1EA] font-semibold text-lg leading-tight">Guest User</h2>
              <p className="text-[#5F6066] font-['JetBrains_Mono',monospace] text-[11px] mt-1.5 tracking-wide">Sign in to access all features</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full mt-2">
              <Link
                href="/test-request"
                className="w-full text-center bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111111] px-5 py-2.5 rounded-[10px] font-['JetBrains_Mono',monospace] text-[10px] font-bold uppercase tracking-widest transition-all no-underline"
              >
                Open Test Request
              </Link>
              <button className="w-full bg-[#1A1A1A] hover:bg-[#232323] text-[#7A7A7A] hover:text-[#E2E2E2] border border-[#333333] px-5 py-2.5 rounded-[10px] font-['JetBrains_Mono',monospace] text-[10px] font-medium uppercase tracking-widest transition-all">
                Sign Out
              </button>
            </div>

            <Link
              href="/"
              className="text-[#3D3D3D] hover:text-[#5F6066] font-['JetBrains_Mono',monospace] text-[9px] uppercase tracking-widest transition-colors no-underline mt-1"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
