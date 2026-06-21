'use client';

import { useTranslation } from 'next-i18next';

export default function LandingHeroSection() {
  const { t } = useTranslation('common');

  const collectionItems = ['User', 'Tags', 'Owner', 'Agent', 'Ai search', 'Ai chat', 'General model', 'Model', 'Tenant', 'Other', 'Collection', 'Manage database'];

  return (
    <section className="relative z-10 pt-4 pb-16 md:pt-6 md:pb-24 px-6 md:px-20 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left: Text */}
        <div className="flex flex-col">
          <div className="inline-flex items-center gap-2 mb-8 self-start">
            <span className="font-['JetBrains_Mono',monospace] text-[11px] font-medium tracking-[0.2em] uppercase text-[#C7A56A]">
              {t('landing.hero.badge')}
            </span>
            <span className="w-px h-3 bg-[#C7A56A]/30"></span>
            <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#7A7B80] tracking-[0.1em]">
              {t('landing.hero.badgeText')}
            </span>
          </div>

          <h1 className="font-['Cormorant_Garamond',serif] font-[500] text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-[-0.02em] text-[#F5F1EA] mb-6">
            {t('landing.hero.headline1')}<br />
            <span className="text-[#C7A56A] italic">{t('landing.hero.headline2')}</span>
          </h1>

          <p className="font-['Inter',sans-serif] text-[16px] md:text-[18px] leading-[1.8] text-[#B7B7BA] mb-4 max-w-lg">
            {t('landing.hero.desc')}
          </p>

          <p className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.08em] uppercase text-[#C7A56A]/70 mb-10">
            {t('landing.hero.microCopy')}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 mb-12">
            <button
              onClick={() => window.open('https://marketplace.visualstudio.com/manage/publishers/BlayerAPI', '_blank')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111111] px-7 py-3.5 rounded-[16px] font-['Inter',sans-serif] font-[600] text-[14px] tracking-wide transition-all duration-200"
            >
              {t('landing.hero.ctaSecondary')}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="w-full sm:w-auto flex items-center gap-3 border border-white/10 rounded-[10px] px-4 py-3">
              <svg className="shrink-0 text-[#C7A56A]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              <div>
                <p className="font-['JetBrains_Mono',monospace] text-[10px] text-[#F5F1EA] font-[500]">Frontend Code Generation</p>
                <p className="font-['Inter',sans-serif] text-[10px] text-[#7A7B80]">Generate API integration code instantly</p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex items-center gap-3 border border-white/10 rounded-[10px] px-4 py-3">
              <svg className="shrink-0 text-[#C7A56A]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
              </svg>
              <div>
                <p className="font-['JetBrains_Mono',monospace] text-[10px] text-[#F5F1EA] font-[500]">Production Ready</p>
                <p className="font-['Inter',sans-serif] text-[10px] text-[#7A7B80]">Built for scalable production workflows</p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex items-center gap-3 border border-white/10 rounded-[10px] px-4 py-3">
              <svg className="shrink-0 text-[#C7A56A]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
              <div>
                <p className="font-['JetBrains_Mono',monospace] text-[10px] text-[#F5F1EA] font-[500]">API Client Workflow</p>
                <p className="font-['Inter',sans-serif] text-[10px] text-[#7A7B80]">Manage, test, and accelerate API integration end-to-end</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: API Client Mockup */}
        <div className="relative">
          {/* Desktop mockup */}
          <div className="hidden sm:block relative">
            <div className="relative rounded-[20px] overflow-hidden border border-white/10 bg-[#0D0E10]">
              {/* Title bar */}
              <div className="flex items-center border-b border-white/10 bg-[#111214]">
                <div className="flex items-center gap-1.5 px-3 py-2 border-r border-white/10">
                  <span className="font-['Inter',sans-serif] text-[10px] text-[#B7B7BA] font-[500] leading-none">Blayer Test Runner</span>
                  <span className="text-[11px] text-[#5F6066] leading-none">✕</span>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center gap-1.5 px-3">
                  <span className="text-[12px] text-[#5F6066] leading-none">□</span>
                  <span className="text-[12px] text-[#5F6066] leading-none">○</span>
                  <span className="text-[12px] text-[#5F6066] leading-none">⋯</span>
                </div>
              </div>

              <div className="flex h-[380px]">
                {/* Left sidebar */}
                <div className="w-40 border-r border-white/10 flex flex-col shrink-0">
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/[0.07]">
                    <span className="font-['JetBrains_Mono',monospace] text-[8px] text-[#5F6066] uppercase tracking-widest leading-none">Collections</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#5F6066] leading-none">⊕</span>
                      <span className="text-[11px] text-[#5F6066] leading-none">⚙</span>
                      <span className="text-[11px] text-[#5F6066] leading-none">+</span>
                    </div>
                  </div>
                  <div className="px-2 py-1.5">
                    <div className="bg-white/[0.04] rounded-[5px] px-2 py-1">
                      <span className="font-['Inter',sans-serif] text-[9px] text-[#5F6066] leading-none">Cari endpoint...</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden px-1.5">
                    {collectionItems.map((item) => (
                      <div key={item} className="flex items-center gap-1.5 px-1.5 py-[3px] rounded-[3px] cursor-default">
                        <span className="w-[5px] h-[5px] rounded-full bg-[#5F6066] shrink-0"></span>
                        <span className="font-['Inter',sans-serif] text-[9px] text-[#7A7B80] leading-none">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/[0.07] px-1.5 py-1">
                    <div className="flex items-center gap-1.5 px-1.5 py-[3px] cursor-default">
                      <span className="w-[5px] h-[5px] rounded-full bg-[#C7A56A] shrink-0"></span>
                      <span className="font-['Inter',sans-serif] text-[9px] text-[#C7A56A] font-[500] leading-none">Activity</span>
                    </div>
                    <div className="pl-3 mt-0.5 space-y-px">
                      <div className="flex items-center gap-1.5 px-1.5 py-1 bg-white/[0.06] rounded-[3px] cursor-default">
                        <span className="font-['JetBrains_Mono',monospace] text-[7px] text-emerald-400 bg-emerald-400/10 px-1 py-px rounded leading-none">GET</span>
                        <span className="font-['Inter',sans-serif] text-[9px] text-[#B7B7BA] leading-none">Activity History</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-1.5 py-1 cursor-default">
                        <span className="font-['JetBrains_Mono',monospace] text-[7px] text-amber-400 bg-amber-400/10 px-1 py-px rounded leading-none">PUT</span>
                        <span className="font-['Inter',sans-serif] text-[9px] text-[#7A7B80] leading-none">Update Activity</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-1.5 py-1 cursor-default">
                        <span className="font-['JetBrains_Mono',monospace] text-[7px] text-red-400 bg-red-400/10 px-1 py-px rounded leading-none">DEL</span>
                        <span className="font-['Inter',sans-serif] text-[9px] text-[#7A7B80] leading-none">Delete Activity</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/[0.07] px-2.5 py-1.5">
                    <div className="flex items-center justify-between cursor-default">
                      <span className="font-['Inter',sans-serif] text-[9px] text-[#7A7B80] leading-none">Vue</span>
                      <span className="text-[11px] text-[#5F6066] leading-none">▾</span>
                    </div>
                  </div>
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-white/10">
                    <div className="flex items-center gap-1 bg-emerald-400/10 border border-emerald-400/20 rounded-[5px] px-1.5 py-1 shrink-0">
                      <span className="font-['JetBrains_Mono',monospace] text-[9px] text-emerald-400 leading-none">GET</span>
                      <span className="text-[10px] text-emerald-400 leading-none">▾</span>
                    </div>
                    <div className="flex-1 bg-white/[0.04] rounded-[5px] px-2 py-1 overflow-hidden">
                      <span className="font-['JetBrains_Mono',monospace] text-[8px] text-[#7A7B80] whitespace-nowrap leading-none">
                        {'{{local_url}}'}/api/v1/activity
                      </span>
                    </div>
                    <button className="bg-[#C7A56A] text-[#111111] font-['Inter',sans-serif] text-[9px] font-[600] px-2.5 py-1 rounded-[5px] shrink-0 leading-none">Send</button>
                  </div>
                  <div className="flex gap-3 px-3 border-b border-white/10">
                    {['Params', 'Authorization', 'Headers'].map((tab) => (
                      <span key={tab} className={`font-['Inter',sans-serif] text-[9px] py-1.5 cursor-default border-b-[1.5px] ${tab === 'Params' ? 'text-[#B7B7BA] border-[#C7A56A]' : 'text-[#5F6066] border-transparent'}`}>
                        {tab}
                      </span>
                    ))}
                  </div>
                  <div className="flex-1 border-t border-white/10 flex flex-col bg-[#0B0B0C]">
                    <div className="flex gap-3 px-3 border-b border-white/10">
                      {['Response', 'State Preview', 'State Management'].map((tab) => (
                        <span key={tab} className={`font-['Inter',sans-serif] text-[9px] py-1.5 cursor-default border-b-[1.5px] ${tab === 'State Management' ? 'text-[#B7B7BA] border-[#C7A56A]' : 'text-[#5F6066] border-transparent'}`}>
                          {tab}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-3 border-b border-white/10">
                      <div className="flex gap-3">
                        {['Types', 'State', 'Service', 'Store', 'Hooks'].map((tab) => (
                          <span key={tab} className={`font-['JetBrains_Mono',monospace] text-[8px] py-1.5 cursor-default border-b-[1.5px] ${tab === 'Store' ? 'text-[#C7A56A] border-[#C7A56A]' : 'text-[#5F6066] border-transparent'}`}>
                            {tab}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="font-['Inter',sans-serif] text-[9px] text-[#C7A56A] bg-[#C7A56A]/[0.08] border border-[#C7A56A]/20 rounded-[4px] px-2 py-0.5 leading-none">Sync</button>
                        <button className="font-['Inter',sans-serif] text-[9px] text-[#B7B7BA] bg-white/[0.06] border border-white/[0.12] rounded-[4px] px-2 py-0.5 leading-none">Copy</button>
                      </div>
                    </div>
                    <div className="flex-1 p-2.5 font-['JetBrains_Mono',monospace] text-[8px] leading-[1.65] overflow-hidden">
                      <div className="text-[#5F6066]">{'// store/activityStore.ts'}</div>
                      <div><span className="text-[#7A7B80]">import </span><span className="text-[#F5F1EA]">{' { defineStore } '}</span><span className="text-[#7A7B80]">from </span><span className="text-[#C7A56A]">&quot;pinia&quot;</span><span className="text-[#7A7B80]">;</span></div>
                      <div><span className="text-[#7A7B80]">import </span><span className="text-[#F5F1EA]">{' { useActivityStates } '}</span><span className="text-[#7A7B80]">from </span><span className="text-[#C7A56A]">&quot;../states/activityStates&quot;</span><span className="text-[#7A7B80]">;</span></div>
                      <div><span className="text-[#7A7B80]">import </span><span className="text-[#F5F1EA]">{' { getV1Activity } '}</span><span className="text-[#7A7B80]">from </span><span className="text-[#C7A56A]">&quot;../service/activityService&quot;</span><span className="text-[#7A7B80]">;</span></div>
                      <br />
                      <div><span className="text-[#7A7B80]">export const </span><span className="text-[#F5F1EA]">useActivityStore</span><span className="text-[#7A7B80]"> = defineStore(</span><span className="text-[#C7A56A]">&quot;useActivityStore&quot;</span><span className="text-[#7A7B80]">, () =&gt; {'{'}</span></div>
                      <div className="pl-3"><span className="text-[#7A7B80]">const </span><span className="text-[#F5F1EA]">{'{ v1Activity }'}</span><span className="text-[#7A7B80]"> = useActivityStates();</span></div>
                      <br />
                      <div className="pl-3"><span className="text-[#7A7B80]">const </span><span className="text-[#C7A56A]">fetchV1Activity</span><span className="text-[#7A7B80]"> = async (payload, isStore = </span><span className="text-[#C7A56A]">true</span><span className="text-[#7A7B80]">) =&gt; {'{'}</span></div>
                      <div className="pl-6"><span className="text-[#7A7B80]">if (isStore) v1Activity.isLoading = </span><span className="text-[#C7A56A]">true</span><span className="text-[#7A7B80]">;</span></div>
                      <div className="pl-6"><span className="text-[#7A7B80]">try {'{'}</span></div>
                      <div className="pl-9"><span className="text-[#7A7B80]">const res = await </span><span className="text-[#C7A56A]">getV1Activity</span><span className="text-[#7A7B80]">(payload);</span></div>
                      <div className="pl-9"><span className="text-[#7A7B80]">v1Activity.data = res?.data ?? [];</span></div>
                      <div className="pl-9"><span className="text-[#7A7B80]">return res;</span></div>
                      <div className="pl-6"><span className="text-[#7A7B80]">{'} '}catch (error) {'{'}</span></div>
                      <div className="pl-9"><span className="text-[#7A7B80]">v1Activity.isError = </span><span className="text-[#C7A56A]">true</span><span className="text-[#7A7B80]">;</span></div>
                      <div className="pl-6"><span className="text-[#7A7B80]">{'} '}finally {'{'}</span></div>
                      <div className="pl-9"><span className="text-[#7A7B80]">if (isStore) v1Activity.isLoading = </span><span className="text-[#C7A56A]">false</span><span className="text-[#7A7B80]">;</span></div>
                      <div className="pl-6"><span className="text-[#7A7B80]">{'}'}</span></div>
                      <div className="pl-3"><span className="text-[#7A7B80]">{'}'}</span></div>
                      <br />
                      <div className="pl-3"><span className="text-[#7A7B80]">return {'{ '}</span><span className="text-[#F5F1EA]">fetchV1Activity</span><span className="text-[#7A7B80]"> {' }'}</span></div>
                      <div><span className="text-[#7A7B80]">{'});'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile mockup */}
          <div className="block sm:hidden overflow-hidden rounded-[20px] border border-white/10" style={{ height: '222px' }}>
            <div style={{ transform: 'scale(0.54)', transformOrigin: 'top left', width: 'calc(100% / 0.54)', background: '#0D0E10' }}>
              <div className="flex items-center border-b border-white/10 bg-[#111214]">
                <div className="flex items-center gap-1.5 px-3 py-2 border-r border-white/10">
                  <span className="font-['Inter',sans-serif] text-[10px] text-[#B7B7BA] font-[500] leading-none">Blayer Test Runner</span>
                  <span className="text-[11px] text-[#5F6066] leading-none">✕</span>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center gap-1.5 px-3">
                  <span className="text-[12px] text-[#5F6066] leading-none">□</span>
                  <span className="text-[12px] text-[#5F6066] leading-none">○</span>
                  <span className="text-[12px] text-[#5F6066] leading-none">⋯</span>
                </div>
              </div>
              <div className="flex h-[380px]">
                <div className="w-40 border-r border-white/10 flex flex-col shrink-0">
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/[0.07]">
                    <span className="font-['JetBrains_Mono',monospace] text-[8px] text-[#5F6066] uppercase tracking-widest leading-none">Collections</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#5F6066] leading-none">⊕</span>
                      <span className="text-[11px] text-[#5F6066] leading-none">⚙</span>
                      <span className="text-[11px] text-[#5F6066] leading-none">+</span>
                    </div>
                  </div>
                  <div className="px-2 py-1.5">
                    <div className="bg-white/[0.04] rounded-[5px] px-2 py-1">
                      <span className="font-['Inter',sans-serif] text-[9px] text-[#5F6066] leading-none">Cari endpoint...</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden px-1.5">
                    {collectionItems.map((item) => (
                      <div key={`m-${item}`} className="flex items-center gap-1.5 px-1.5 py-[3px] rounded-[3px] cursor-default">
                        <span className="w-[5px] h-[5px] rounded-full bg-[#5F6066] shrink-0"></span>
                        <span className="font-['Inter',sans-serif] text-[9px] text-[#7A7B80] leading-none">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/[0.07] px-1.5 py-1">
                    <div className="flex items-center gap-1.5 px-1.5 py-[3px] cursor-default">
                      <span className="w-[5px] h-[5px] rounded-full bg-[#C7A56A] shrink-0"></span>
                      <span className="font-['Inter',sans-serif] text-[9px] text-[#C7A56A] font-[500] leading-none">Activity</span>
                    </div>
                    <div className="pl-3 mt-0.5 space-y-px">
                      <div className="flex items-center gap-1.5 px-1.5 py-1 bg-white/[0.06] rounded-[3px] cursor-default">
                        <span className="font-['JetBrains_Mono',monospace] text-[7px] text-emerald-400 bg-emerald-400/10 px-1 py-px rounded leading-none">GET</span>
                        <span className="font-['Inter',sans-serif] text-[9px] text-[#B7B7BA] leading-none">Activity History</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-1.5 py-1 cursor-default">
                        <span className="font-['JetBrains_Mono',monospace] text-[7px] text-amber-400 bg-amber-400/10 px-1 py-px rounded leading-none">PUT</span>
                        <span className="font-['Inter',sans-serif] text-[9px] text-[#7A7B80] leading-none">Update Activity</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-1.5 py-1 cursor-default">
                        <span className="font-['JetBrains_Mono',monospace] text-[7px] text-red-400 bg-red-400/10 px-1 py-px rounded leading-none">DEL</span>
                        <span className="font-['Inter',sans-serif] text-[9px] text-[#7A7B80] leading-none">Delete Activity</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-white/10">
                    <div className="flex items-center gap-1 bg-emerald-400/10 border border-emerald-400/20 rounded-[5px] px-1.5 py-1 shrink-0">
                      <span className="font-['JetBrains_Mono',monospace] text-[9px] text-emerald-400 leading-none">GET</span>
                    </div>
                    <div className="flex-1 bg-white/[0.04] rounded-[5px] px-2 py-1 overflow-hidden">
                      <span className="font-['JetBrains_Mono',monospace] text-[8px] text-[#7A7B80] whitespace-nowrap leading-none">
                        {'{{local_url}}'}/api/v1/activity
                      </span>
                    </div>
                    <button className="bg-[#C7A56A] text-[#111111] font-['Inter',sans-serif] text-[9px] font-[600] px-2.5 py-1 rounded-[5px] shrink-0 leading-none">Send</button>
                  </div>
                  <div className="flex gap-3 px-3 border-b border-white/10">
                    <span className="font-['Inter',sans-serif] text-[9px] py-1.5 cursor-default border-b-[1.5px] text-[#B7B7BA] border-[#C7A56A]">Params</span>
                    <span className="font-['Inter',sans-serif] text-[9px] py-1.5 cursor-default border-b-[1.5px] text-[#5F6066] border-transparent">Headers</span>
                  </div>
                  <div className="flex-1 border-t border-white/10 flex flex-col bg-[#0B0B0C]">
                    <div className="flex gap-3 px-3 border-b border-white/10">
                      <span className="font-['Inter',sans-serif] text-[9px] py-1.5 cursor-default border-b-[1.5px] text-[#B7B7BA] border-[#C7A56A]">State Management</span>
                    </div>
                    <div className="flex items-center justify-between px-3 border-b border-white/10">
                      <div className="flex gap-3">
                        {['Types', 'State', 'Service', 'Store', 'Hooks'].map((tab) => (
                          <span key={`m-${tab}`} className={`font-['JetBrains_Mono',monospace] text-[8px] py-1.5 cursor-default border-b-[1.5px] ${tab === 'Store' ? 'text-[#C7A56A] border-[#C7A56A]' : 'text-[#5F6066] border-transparent'}`}>
                            {tab}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 p-2.5 font-['JetBrains_Mono',monospace] text-[8px] leading-[1.65] overflow-hidden">
                      <div className="text-[#5F6066]">{'// store/activityStore.ts'}</div>
                      <div><span className="text-[#7A7B80]">import </span><span className="text-[#F5F1EA]">{' { defineStore } '}</span><span className="text-[#7A7B80]">from </span><span className="text-[#C7A56A]">&quot;pinia&quot;</span><span className="text-[#7A7B80]">;</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
