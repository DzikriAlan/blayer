'use client';

import { useTranslation } from 'next-i18next';

export default function LandingCTASection() {
  const { t } = useTranslation('common');

  return (
    <section id="testimonial" className="w-full overflow-hidden py-20 md:py-32 relative z-10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        {/* Desktop: 2-column layout */}
        <div className="hidden lg:grid grid-cols-[1fr_3fr] gap-16 items-start">
          <div className="pt-2">
            <p className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.2em] uppercase text-[#C7A56A] mb-4">
              {t('landing.cta.testimonialTitle')}
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] font-[500] text-[clamp(2rem,3vw,2.5rem)] leading-[1.1] text-[#F5F1EA]">
              {t('landing.cta.testimonialTitle')}<br />
              <span className="italic text-[#C7A56A]">{t('landing.cta.testimonialTitleSpan')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-[#0B0B0C] border border-white/10 rounded-[20px] p-6 hover:border-[rgba(199,165,106,0.18)] transition-all duration-300">
                <div className="font-['Cormorant_Garamond',serif] text-[48px] leading-none text-[#C7A56A]/40 mb-3 font-[600]">&ldquo;</div>
                <p className="font-['Cormorant_Garamond',serif] text-[16px] text-[#F5F1EA] leading-[1.7] italic">
                  {t(`landing.cta.testimonials.${i}.quote`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <p className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.2em] uppercase text-[#C7A56A] mb-4">
            {t('landing.cta.testimonialTitle')}
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] font-[500] text-[clamp(2rem,8vw,2.5rem)] leading-[1.1] text-[#F5F1EA] mb-8">
            {t('landing.cta.testimonialTitle')}<br />
            <span className="italic text-[#C7A56A]">{t('landing.cta.testimonialTitleSpan')}</span>
          </h2>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-6 px-6 md:-mx-20 md:px-20 scrollbar-hide">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-shrink-0 w-[80vw] snap-center bg-[#0B0B0C] border border-white/10 rounded-[20px] p-6">
                <div className="font-['Cormorant_Garamond',serif] text-[48px] leading-none text-[#C7A56A]/40 mb-3 font-[600]">&ldquo;</div>
                <p className="font-['Cormorant_Garamond',serif] text-[16px] text-[#F5F1EA] leading-[1.7] italic">
                  {t(`landing.cta.testimonials.${i}.quote`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA bar */}
      <div className="mt-16 md:mt-24 max-w-[1440px] mx-auto px-6 md:px-20">
        <div className="relative rounded-[24px] bg-[#0B0B0C] border border-white/10 px-8 md:px-16 py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#C7A56A]/[0.04] rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.2em] uppercase text-[#C7A56A] mb-3">
              {t('landing.cta.title')}
            </p>
            <h3 className="font-['Cormorant_Garamond',serif] font-[500] text-[clamp(1.75rem,3.5vw,2.75rem)] text-[#F5F1EA] leading-[1.1]">
              {t('landing.cta.button')}<span className="text-[#C7A56A]">.</span>
            </h3>
            <p className="font-['Inter',sans-serif] text-[14px] text-[#7A7B80] mt-2 leading-relaxed max-w-md">
              {t('landing.cta.subtitle')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => window.open('https://marketplace.visualstudio.com/items?itemName=blayerapi.blayer', '_blank')}
              className="inline-flex items-center gap-2 bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111111] px-7 py-3.5 rounded-[16px] font-['Inter',sans-serif] font-[600] text-[14px] tracking-wide transition-all duration-200 whitespace-nowrap"
            >
              Get UI Kits
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="font-['Inter',sans-serif] text-[13px] text-[#C7A56A] hover:text-[#D5B57D] underline underline-offset-4 transition-colors whitespace-nowrap">
              Browse Marketplace
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
