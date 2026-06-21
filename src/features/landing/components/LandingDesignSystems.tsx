'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';

interface Product {
  id: number;
  badge: string | null;
  name: string;
  creator: string;
  desc: string;
  tags: string[];
  price: string;
  bg: string;
  accent: string;
}

export default function LandingDesignSystems() {
  const { t } = useTranslation('common');
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const products: Product[] = [
    { id: 1, badge: 'NEW', name: 'Blayer Base', creator: 'Blayer', desc: 'API-ready foundation for SaaS. Forms, tables, and data views wired to connect with generated services.', tags: ['React', 'TypeScript'], price: '$129', bg: 'from-[#0c1220] to-[#1a2a45]', accent: '#3b82f6' },
    { id: 2, badge: null, name: 'Blayer Pro', creator: 'Blayer', desc: 'Advanced UI patterns for API-driven apps — mutations, pagination, and live data out of the box.', tags: ['React', 'TypeScript'], price: '$199', bg: 'from-[#0d1117] to-[#1a1f2e]', accent: '#8b5cf6' },
    { id: 3, badge: null, name: 'Aurora', creator: 'North Studio', desc: 'Analytics dashboard components designed to display live API responses and data streams.', tags: ['React', 'Tailwind'], price: '$149', bg: 'from-[#061a0e] to-[#0a2818]', accent: '#10b981' },
    { id: 4, badge: 'NEW', name: 'Nexus Dashboard', creator: 'Craftwork', desc: 'Enterprise layouts built for real-time data fetching and complex API state management.', tags: ['Vue', 'TypeScript'], price: '$179', bg: 'from-[#080e1a] to-[#0f1e30]', accent: '#06b6d4' },
    { id: 5, badge: null, name: 'Prism System', creator: 'Supercharge', desc: "Figma tokens and variables that map directly to Blayer's generated design tokens.", tags: ['Figma', 'Tokens'], price: '$89', bg: 'from-[#1c0a0a] to-[#3b0d07]', accent: '#ef4444' },
    { id: 6, badge: null, name: 'Solara Landing', creator: 'Emura', desc: 'Marketing templates with dynamic sections wired for API-driven content and endpoints.', tags: ['Figma', 'Webflow'], price: '$47', bg: 'from-[#0c1220] to-[#162440]', accent: '#f59e0b' },
  ];

  const visibleCount = 3;
  const maxSlide = Math.max(0, products.length - visibleCount);
  const dots = Math.ceil(products.length / visibleCount);
  const activeDot = Math.floor(currentSlide / visibleCount);

  const prev = () => { if (currentSlide > 0) setCurrentSlide(currentSlide - 1); };
  const next = () => { if (currentSlide < maxSlide) setCurrentSlide(currentSlide + 1); };

  return (
    <section id="design-systems" className="py-20 md:py-32 border-t border-white/10 relative z-10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-10 lg:gap-16 items-start">
          {/* Left: info */}
          <div className="flex flex-col">
            <p className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.2em] uppercase text-[#C7A56A] mb-4">
              {t('landing.designSystems.badge')}
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] font-[500] text-[clamp(2rem,3.5vw,2.75rem)] leading-[1.1] text-[#F5F1EA] mb-4">
              {t('landing.designSystems.title')}<br />
              <span className="italic text-[#C7A56A]">{t('landing.designSystems.titleSpan')}</span>
            </h2>
            <p className="font-['Inter',sans-serif] text-[14px] text-[#7A7B80] leading-[1.8] mb-8">
              Handpicked UI kits tested to work with Blayer&apos;s API generator. Each kit ships with components, hooks, and data patterns that connect directly to your generated services.
            </p>
            <button className="self-start inline-flex items-center gap-2 border border-white/[0.12] hover:border-[rgba(199,165,106,0.25)] text-[#F5F1EA] hover:text-[#C7A56A] px-5 py-2.5 rounded-[12px] font-['Inter',sans-serif] text-[13px] font-[500] transition-all duration-200">
              Browse API-Ready Kits
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Right: cards (desktop) */}
          <div className="hidden lg:block">
            <div className="flex justify-end gap-2 mb-5">
              <button onClick={prev} disabled={currentSlide === 0}
                className="w-8 h-8 rounded-full border border-white/[0.12] flex items-center justify-center text-[#7A7B80] hover:border-[rgba(199,165,106,0.25)] hover:text-[#C7A56A] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 9L4.5 6l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={next} disabled={currentSlide >= maxSlide}
                className="w-8 h-8 rounded-full border border-white/[0.12] flex items-center justify-center text-[#7A7B80] hover:border-[rgba(199,165,106,0.25)] hover:text-[#C7A56A] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 3L7.5 6l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex gap-4 transition-transform duration-400 ease-in-out"
                style={{ transform: `translateX(calc(-${currentSlide} * (100% / ${visibleCount} + 5.3px)))` }}
              >
                {products.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[calc(33.333%-11px)] bg-[#0B0B0C] border border-white/10 rounded-[20px] overflow-hidden hover:border-[rgba(199,165,106,0.18)] transition-all duration-300 cursor-pointer group">
                    <div className={`relative h-[160px] overflow-hidden bg-gradient-to-br ${product.bg}`}>
                      <div className="absolute inset-3 rounded-[10px] bg-black/30 border border-white/10 p-2.5">
                        <div className="flex gap-1 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 rounded-full bg-white/10 w-3/4"></div>
                          <div className="h-1.5 rounded-full bg-white/[0.07] w-1/2"></div>
                          <div className="h-8 rounded-[6px] mt-2 border" style={{ backgroundColor: product.accent + '20', borderColor: product.accent + '30' }}></div>
                          <div className="flex gap-1">
                            <div className="h-6 rounded-[6px] flex-1" style={{ backgroundColor: product.accent + '15' }}></div>
                            <div className="h-6 rounded-[6px] flex-1 bg-white/[0.05]"></div>
                          </div>
                        </div>
                      </div>
                      {product.badge && (
                        <div className="absolute top-2.5 left-2.5 bg-[#C7A56A] text-[#111111] text-[9px] font-['JetBrains_Mono',monospace] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {product.badge}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-['Inter',sans-serif] font-[600] text-[13px] text-[#F5F1EA] mb-0.5">{product.name}</p>
                      <p className="font-['Inter',sans-serif] text-[11px] text-[#5F6066] mb-2">by {product.creator}</p>
                      <p className="font-['Inter',sans-serif] text-[11px] text-[#7A7B80] leading-[1.6] mb-3">{product.desc}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5 flex-wrap">
                          {product.tags.map((tag) => (
                            <span key={tag} className="font-['JetBrains_Mono',monospace] text-[9px] px-2 py-0.5 rounded-full border border-white/[0.12] text-[#7A7B80]">{tag}</span>
                          ))}
                        </div>
                        <span className="font-['Cormorant_Garamond',serif] text-[16px] font-[600] text-[#F5F1EA]">{product.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-1.5 mt-5">
              {Array.from({ length: dots }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i * visibleCount)}
                  className={`rounded-full transition-all duration-200 ${activeDot === i ? 'w-4 h-1.5 bg-[#C7A56A]' : 'w-1.5 h-1.5 bg-white/20'}`}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex lg:hidden w-screen overflow-x-auto snap-x snap-mandatory gap-3 mt-8 pb-6 -mx-6 px-6 md:-mx-20 md:px-20 scrollbar-hide" ref={scrollRef}>
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[80vw] snap-center bg-[#0B0B0C] border border-white/10 rounded-[20px] overflow-hidden">
              <div className={`relative h-[140px] overflow-hidden bg-gradient-to-br ${product.bg}`}>
                <div className="absolute inset-3 rounded-[10px] bg-black/30 border border-white/10 p-2.5">
                  <div className="flex gap-1 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 w-3/4 mb-1.5"></div>
                  <div className="h-1.5 rounded-full bg-white/[0.07] w-1/2"></div>
                </div>
                {product.badge && (
                  <div className="absolute top-2.5 left-2.5 bg-[#C7A56A] text-[#111111] text-[9px] font-['JetBrains_Mono',monospace] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {product.badge}
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-['Inter',sans-serif] font-[600] text-[13px] text-[#F5F1EA] mb-0.5">{product.name}</p>
                <p className="font-['Inter',sans-serif] text-[11px] text-[#5F6066] mb-2">by {product.creator}</p>
                <p className="font-['Inter',sans-serif] text-[11px] text-[#7A7B80] leading-[1.6] mb-3 line-clamp-2">{product.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">{product.tags.map(tag => (
                    <span key={tag} className="font-['JetBrains_Mono',monospace] text-[9px] px-2 py-0.5 rounded-full border border-white/[0.12] text-[#7A7B80]">{tag}</span>
                  ))}</div>
                  <span className="font-['Cormorant_Garamond',serif] text-[16px] font-[600] text-[#F5F1EA]">{product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
