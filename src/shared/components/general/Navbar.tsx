'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

export default function Navbar() {
  const { t } = useTranslation('common');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const sections = ['design-systems', 'testimonial'];

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    const navData = (window as unknown as Record<string, unknown>);
    const lastScrollY = parseInt(String(navData.__lastScrollY || '0'));
    setIsNavVisible(currentY < lastScrollY || currentY < 60);
    navData.__lastScrollY = currentY;

    if (isMenuOpen) setIsMenuOpen(false);

    const offset = window.innerHeight * 0.4;
    let current = '';
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) {
        current = id;
      }
    }
    setActiveSection(current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`fixed top-6 left-0 right-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        <nav className="relative flex justify-between items-center px-8 h-16 bg-[#050505]/90 backdrop-blur-xl border border-white/10 rounded-[24px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-['Cormorant_Garamond',serif] text-[26px] tracking-[-0.02em] font-[600] text-[#F5F1EA] uppercase italic">
              BLAYER
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-10">
            <button
              onClick={() => scrollTo('design-systems')}
              className={`font-['JetBrains_Mono',monospace] text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-300 ${
                activeSection === 'design-systems' ? 'text-[#F5F1EA]' : 'text-[#5F6066] hover:text-[#F5F1EA]'
              }`}
            >
              {t('landing.nav.designSystems')}
            </button>
            <button
              onClick={() => scrollTo('testimonial')}
              className={`font-['JetBrains_Mono',monospace] text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-300 ${
                activeSection === 'testimonial' ? 'text-[#F5F1EA]' : 'text-[#5F6066] hover:text-[#F5F1EA]'
              }`}
            >
              {t('landing.nav.testimonial')}
            </button>
            <Link
              href="/test-request"
              className="font-['JetBrains_Mono',monospace] text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-300 text-[#5F6066] hover:text-[#F5F1EA]"
            >
              Test Request
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open('https://marketplace.visualstudio.com/manage/publishers/BlayerAPI', '_blank')}
              className="hidden md:block bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111111] px-5 py-2.5 rounded-[10px] font-['JetBrains_Mono',monospace] text-[10px] font-bold uppercase tracking-widest transition-all duration-300"
            >
              Login
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white/70 hover:text-white transition-colors p-2"
            >
              {!isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {isMenuOpen && (
            <div className="absolute top-[calc(100%+12px)] left-0 right-0 p-6 bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] lg:hidden z-50 flex flex-col gap-6 shadow-2xl">
              <button
                onClick={() => scrollTo('design-systems')}
                className={`text-left font-['JetBrains_Mono',monospace] text-[12px] font-medium uppercase tracking-[0.2em] transition-colors ${
                  activeSection === 'design-systems' ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {t('landing.nav.designSystems')}
              </button>
              <button
                onClick={() => scrollTo('testimonial')}
                className={`text-left font-['JetBrains_Mono',monospace] text-[12px] font-medium uppercase tracking-[0.2em] transition-colors ${
                  activeSection === 'testimonial' ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {t('landing.nav.testimonial')}
              </button>
              <Link
                href="/test-request"
                className="block text-left font-['JetBrains_Mono',monospace] text-[12px] font-medium uppercase tracking-[0.2em] transition-colors text-white/70 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Test Request
              </Link>
              <div className="h-[1px] bg-white/10 my-2"></div>
              <button
                onClick={() => window.open('https://marketplace.visualstudio.com/manage/publishers/BlayerAPI', '_blank')}
                className="w-full bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111111] py-4 rounded-[10px] font-['JetBrains_Mono',monospace] text-[12px] font-bold uppercase tracking-widest transition-all"
              >
                Login
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
