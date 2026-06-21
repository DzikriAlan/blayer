'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative z-10 py-10 px-6 md:px-20 border-t border-white/10 mt-auto">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <Link href="/" className="font-['Cormorant_Garamond',serif] text-[20px] tracking-[-0.02em] font-[600] text-[#F5F1EA] uppercase italic">
              BLAYER
            </Link>
            <p className="font-['JetBrains_Mono',monospace] text-[10px] text-[#5F6066] tracking-wide">
              &copy; {new Date().getFullYear()} Blayer. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/contact"
              className="font-['JetBrains_Mono',monospace] text-[10px] text-[#5F6066] hover:text-[#C7A56A] uppercase tracking-widest transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/privacy-policy"
              className="font-['JetBrains_Mono',monospace] text-[10px] text-[#5F6066] hover:text-[#C7A56A] uppercase tracking-widest transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="font-['JetBrains_Mono',monospace] text-[10px] text-[#5F6066] hover:text-[#C7A56A] uppercase tracking-widest transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/generator"
              className="font-['JetBrains_Mono',monospace] text-[10px] text-[#5F6066] hover:text-[#C7A56A] uppercase tracking-widest transition-colors"
            >
              Generator
            </Link>
          </div>

          {/* CTA */}
          <button
            onClick={() => window.open('https://marketplace.visualstudio.com/items?itemName=blayerapi.blayer', '_blank')}
            className="bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111111] px-5 py-2 rounded-[10px] font-['JetBrains_Mono',monospace] text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Get VS Code Extension
          </button>
        </div>
      </div>
    </footer>
  );
}
