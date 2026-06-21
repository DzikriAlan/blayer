import type { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const Confirm: NextPage = () => {
  const router = useRouter();
  const { from } = router.query;

  const fromVSCode = from === 'vscode';

  const accessToken = '';
  const refreshToken = '';

  const buildVSCodeUri = (at: string, rt: string) =>
    `vscode://BlayerAPI.blayer/auth-callback?access_token=${encodeURIComponent(at)}&refresh_token=${encodeURIComponent(rt)}`;

  useEffect(() => {
    if (!fromVSCode) {
      router.replace('/');
    }
  }, [fromVSCode, router]);

  return (
    <>
      <Head>
        <title>Authenticating - Blayer</title>
      </Head>
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        {fromVSCode && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C7A56A" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span className="text-[#C7A56A] font-['JetBrains_Mono',monospace] text-[11px] tracking-widest uppercase">Login Successful</span>
            </div>
            <p className="text-[#5F6066] font-['JetBrains_Mono',monospace] text-[10px] text-center">
              VS Code should open automatically.<br />If not, click the button below.
            </p>
            <Link
              href={buildVSCodeUri(accessToken, refreshToken)}
              className="px-6 py-2.5 bg-[#C7A56A] text-[#111] font-['JetBrains_Mono',monospace] text-[11px] font-bold rounded-lg uppercase tracking-widest hover:bg-[#D5B57D] transition-colors no-underline"
            >
              Return to VS Code →
            </Link>
          </div>
        )}
        {!fromVSCode && (
          <span className="text-[#C7A56A] font-['JetBrains_Mono',monospace] text-sm tracking-widest uppercase">Authenticating...</span>
        )}
      </div>
    </>
  );
};

export default Confirm;
