'use client';

export default function LandingPriceSection() {
  const freeFeatures = [
    { title: '5 API endpoints', desc: 'Generate code for up to 5 endpoints' },
    { title: 'TypeScript types', desc: 'Auto-generated type definitions' },
    { title: 'Basic state management', desc: 'Zustand stores included' },
    { title: 'Community support', desc: 'GitHub discussions & docs' },
  ];
  const starterFeatures = [
    { title: '50 API endpoints', desc: 'Scale your API integration' },
    { title: 'All code types', desc: 'Types, states, services & controllers' },
    { title: 'TanStack Query hooks', desc: 'Production-ready controllers' },
    { title: 'Email support', desc: 'Priority response within 24h' },
    { title: 'Swagger/Postman import', desc: 'Import existing API specs' },
  ];
  const proFeatures = [
    { title: 'Unlimited endpoints', desc: 'No limits on API generation' },
    { title: 'Custom templates', desc: 'Define your own code patterns' },
    { title: 'CLI integration', desc: 'CI/CD pipeline ready' },
    { title: 'Priority support', desc: 'Response within 4 hours' },
    { title: 'Team collaboration', desc: 'Share configs across team' },
    { title: 'Advanced auth patterns', desc: 'OAuth, JWT, API keys support' },
  ];
  const eliteFeatures = [
    { title: 'Everything in Pro', desc: 'All Pro features included' },
    { title: 'Dedicated support', desc: 'Personal account manager' },
    { title: 'Custom integrations', desc: 'Tailored to your stack' },
    { title: 'SLA guarantee', desc: '99.9% uptime commitment' },
    { title: 'On-premise option', desc: 'Deploy on your infrastructure' },
  ];

  const tierFeatures = [freeFeatures, starterFeatures, proFeatures, eliteFeatures];
  const tierNames = ['Free', 'Starter', 'Pro', 'Elite'];
  const tierDescs = [
    'For individual developers exploring API integration',
    'For small teams building API-driven apps',
    'For professional teams with complex API needs',
    'For enterprises with custom requirements',
  ];
  const tierPrices = ['$0', '$12', '$29', 'Custom'];
  const tierPeriods = ['/forever', '/month', '/month', ''];
  const tierCtas = ['Get Started Free', 'Start Free Trial', 'Start Free Trial', 'Contact Sales'];

  return (
    <section id="pricing" className="py-20 md:py-32 border-t border-white/10 relative z-10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <p className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.2em] uppercase text-[#C7A56A] mb-4">
            Pricing
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] font-[500] text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-[#F5F1EA]">
            Simple, Transparent
            <span className="text-[#C7A56A] italic"> Pricing</span>
          </h2>
        </div>

        {/* Desktop: 4-column grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-5">
          {tierFeatures.map((features, i) => {
            const isPro = i === 2;
            return (
              <div
                key={i}
                className={`rounded-[24px] p-7 lg:p-8 flex flex-col items-start relative ${
                  isPro
                    ? 'bg-[#111214] border border-[rgba(199,165,106,0.25)] scale-[1.03] z-10 shadow-[0_0_50px_rgba(199,165,106,0.08)]'
                    : 'bg-[#0B0B0C] border border-white/10'
                }`}
              >
                {isPro && (
                  <div className="absolute top-0 right-0 bg-[#C7A56A] text-[#111] text-[9px] px-4 py-1.5 font-['JetBrains_Mono',monospace] font-bold uppercase tracking-widest rounded-bl-[14px]">
                    Popular
                  </div>
                )}
                <div className={`font-['JetBrains_Mono',monospace] text-[10px] tracking-widest mb-3 uppercase ${isPro ? 'text-[#C7A56A] font-bold' : 'text-[#7A7B80]'}`}>
                  {tierNames[i]}
                </div>
                <p className="font-['Inter',sans-serif] text-[13px] text-[#5F6066] mb-5 leading-snug">{tierDescs[i]}</p>
                <div className={`font-['Cormorant_Garamond',serif] text-[3rem] font-[500] mb-7 leading-none ${isPro ? 'text-[#C7A56A]' : 'text-[#F5F1EA]'}`}>
                  {tierPrices[i]}
                  {tierPeriods[i] && (
                    <span className="text-base font-['Inter',sans-serif] font-normal text-[#7A7B80] ml-2 tracking-normal">{tierPeriods[i]}</span>
                  )}
                </div>
                <div className="space-y-2.5 mb-10 flex-grow w-full">
                  {features.map((f, j) => (
                    <div key={j} className="flex gap-2.5">
                      <svg className="text-[#C7A56A] w-[14px] h-[14px] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <div>
                        <div className={`font-['Inter',sans-serif] text-[12px] ${isPro ? 'text-[#F5F1EA]' : 'text-[#B7B7BA]'}`}>{f.title}</div>
                        <p className={`font-['Inter',sans-serif] text-[11px] ${isPro ? 'text-[#7A7B80]' : 'text-[#5F6066]'}`}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className={`w-full py-3 rounded-[16px] font-['JetBrains_Mono',monospace] text-[10px] uppercase tracking-widest transition-all font-bold ${
                    isPro
                      ? 'bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111] shadow-[0_8px_30px_rgba(199,165,106,0.16)]'
                      : 'border border-white/[0.12] hover:border-[rgba(199,165,106,0.25)] hover:bg-[#C7A56A]/[0.04] text-[#F5F1EA]'
                  }`}
                >
                  {tierCtas[i]}
                </button>
              </div>
            );
          })}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex lg:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-6 px-6 scrollbar-hide">
          {tierFeatures.map((features, i) => {
            const isPro = i === 2;
            return (
              <div
                key={i}
                className={`flex-shrink-0 w-[78vw] snap-center rounded-[24px] p-7 flex flex-col items-start relative ${
                  isPro
                    ? 'bg-[#111214] border border-[rgba(199,165,106,0.25)]'
                    : 'bg-[#0B0B0C] border border-white/10'
                }`}
              >
                {isPro && (
                  <div className="absolute top-0 right-0 bg-[#C7A56A] text-[#111] text-[9px] px-4 py-1.5 font-['JetBrains_Mono',monospace] font-bold uppercase tracking-widest rounded-bl-[14px]">
                    Popular
                  </div>
                )}
                <div className={`font-['JetBrains_Mono',monospace] text-[10px] tracking-widest mb-3 uppercase ${isPro ? 'text-[#C7A56A] font-bold' : 'text-[#7A7B80]'}`}>
                  {tierNames[i]}
                </div>
                <p className="font-['Inter',sans-serif] text-[13px] text-[#5F6066] mb-5 leading-snug">{tierDescs[i]}</p>
                <div className={`font-['Cormorant_Garamond',serif] text-[3rem] font-[500] mb-7 leading-none ${isPro ? 'text-[#C7A56A]' : 'text-[#F5F1EA]'}`}>
                  {tierPrices[i]}
                  {tierPeriods[i] && (
                    <span className="text-base font-['Inter',sans-serif] font-normal text-[#7A7B80] ml-2 tracking-normal">{tierPeriods[i]}</span>
                  )}
                </div>
                <div className="space-y-2.5 mb-10 flex-grow w-full">
                  {features.map((f, j) => (
                    <div key={j} className="flex gap-2.5">
                      <svg className="text-[#C7A56A] w-[14px] h-[14px] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <div>
                        <div className={`font-['Inter',sans-serif] text-[12px] ${isPro ? 'text-[#F5F1EA]' : 'text-[#B7B7BA]'}`}>{f.title}</div>
                        <p className={`font-['Inter',sans-serif] text-[11px] ${isPro ? 'text-[#7A7B80]' : 'text-[#5F6066]'}`}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className={`w-full py-3 rounded-[16px] font-['JetBrains_Mono',monospace] text-[10px] uppercase tracking-widest transition-all font-bold ${
                    isPro
                      ? 'bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111] shadow-[0_8px_30px_rgba(199,165,106,0.16)]'
                      : 'border border-white/[0.12] hover:border-[rgba(199,165,106,0.25)] hover:bg-[#C7A56A]/[0.04] text-[#F5F1EA]'
                  }`}
                >
                  {tierCtas[i]}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
