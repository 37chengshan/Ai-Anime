import React from 'react';
import { Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

const PLANS = [
  {
    name: 'Standard Edition',
    price: '0',
    period: '/mo',
    description: 'A complimentary membership to explore the world of AI art.',
    features: [
      'Access to public gallery pieces',
      'Standard 1080p image downloads',
      'Engage with standard articles',
      'Basic AI editorial assistant'
    ],
    buttonText: 'CURRENT STATUS',
    popular: false,
    theme: 'light'
  },
  {
    name: 'PRO Subscription',
    price: '19',
    period: '/mo',
    description: 'Unrestricted access to the complete digital archive and advanced tools.',
    features: [
      'Access to PRO exclusive collections',
      'Uncompressed high-res print files',
      'Infinite AI copywriting assistance',
      'Curated tutorials and resources',
      'Priority manuscript review'
    ],
    buttonText: 'SUBSCRIBE TO PRO',
    popular: true,
    theme: 'dark'
  }
];

export function Pricing() {
  const handleSubscribe = (plan: typeof PLANS[0]) => {
    if (plan.price === '0') return;
    toast.info('Connecting to secure payment gateway...');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-transparent py-16 lg:py-24 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <header className="text-center mb-24 flex flex-col items-center">
          <span className="editorial-caption text-[#c44d36] mb-8 uppercase tracking-[0.2em] border-b border-[#c44d36] pb-2">
            MEMBERSHIP & CIRCULATION
          </span>
          <h1 className="editorial-title text-6xl md:text-8xl leading-[0.9] tracking-[-0.04em] mb-10 text-[#1a1918]">
            Subscribe to the Archive
          </h1>
          <p className="editorial-body text-xl max-w-2xl mx-auto italic text-[#4a4845]">
            Join a community of visual pioneers. Gain unrestricted access to high-fidelity prints, exclusive editorial pieces, and our advanced AI toolset.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 max-w-4xl mx-auto items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              className={clsx(
                "relative p-10 lg:p-14 border-[3px] flex flex-col transition-colors",
                plan.theme === 'dark' 
                  ? "bg-[#1a1918] border-[#1a1918] text-[#fdfaf6] shadow-2xl" 
                  : "bg-texture-light border-[#1a1918]/20 hover:border-[#1a1918] text-[#1a1918]"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 bg-[#c44d36] text-[#fdfaf6] border border-[#fdfaf6] text-xs font-black uppercase tracking-[0.2em] px-4 py-2 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  RECOMMENDED
                </div>
              )}
              
              <div className="mb-12 flex-1">
                <h3 className={clsx("editorial-title text-3xl md:text-4xl mb-4", plan.theme === 'dark' ? "text-[#fdfaf6]" : "text-[#1a1918]")}>
                  {plan.name}
                </h3>
                <p className={clsx("font-serif italic text-lg leading-relaxed min-h-[60px]", plan.theme === 'dark' ? "text-[#fdfaf6]/70" : "text-[#4a4845]")}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-12 flex items-start gap-1 pb-10 border-b border-opacity-20 border-current">
                <span className="text-xl font-bold mt-2">$</span>
                <span className={clsx("text-7xl font-black tracking-tighter", plan.theme === 'dark' ? "text-[#fdfaf6]" : "text-[#1a1918]")}>
                  {plan.price}
                </span>
                <span className={clsx("editorial-caption text-sm ml-2 mt-auto pb-2 font-bold", plan.theme === 'dark' ? "text-[#fdfaf6]/50" : "text-[#4a4845]")}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-6 mb-16">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-4">
                    <Check className={clsx("w-5 h-5 shrink-0", plan.theme === 'dark' ? "text-[#c44d36]" : "text-[#1a1918]")} strokeWidth={2} />
                    <span className={clsx("font-serif italic leading-relaxed", plan.theme === 'dark' ? "text-[#fdfaf6]" : "text-[#1a1918]")}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                className={clsx(
                  "w-full py-5 editorial-caption font-bold tracking-[0.2em] transition-all border",
                  plan.theme === 'dark'
                    ? "bg-[#fdfaf6] text-[#1a1918] border-[#fdfaf6] hover:bg-transparent hover:text-[#fdfaf6]"
                    : "bg-transparent text-[#1a1918] border-[#1a1918] hover:bg-[#1a1918] hover:text-[#fdfaf6]"
                )}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        <footer className="mt-32 pt-16 border-t border-[#1a1918]/20 text-center max-w-2xl mx-auto">
          <span className="editorial-caption block mb-8 text-[#4a4845]">SUBSCRIBER BENEFITS OVERVIEW</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            <div className="flex flex-col items-center justify-center border-r border-[#1a1918]/20 pr-4 md:pr-8">
              <ImageIcon className="w-6 h-6 text-[#1a1918] mb-3" strokeWidth={1.5} />
              <span className="editorial-caption text-[9px] font-bold text-center leading-relaxed">LOSSLESS FORMATS</span>
            </div>
            <div className="flex flex-col items-center justify-center md:border-r border-[#1a1918]/20 px-4 md:px-8">
              <span className="font-serif italic text-2xl text-[#1a1918] mb-1">AI</span>
              <span className="editorial-caption text-[9px] font-bold text-center leading-relaxed">ASSISTANT SUITE</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-[#1a1918]/20 px-4 md:px-8 mt-8 md:mt-0">
              <Sparkles className="w-6 h-6 text-[#1a1918] mb-3" strokeWidth={1.5} />
              <span className="editorial-caption text-[9px] font-bold text-center leading-relaxed">EXCLUSIVE RELEASES</span>
            </div>
            <div className="flex flex-col items-center justify-center pl-4 md:pl-8 mt-8 md:mt-0">
              <span className="font-serif italic text-2xl text-[#1a1918] mb-1">&copy;</span>
              <span className="editorial-caption text-[9px] font-bold text-center leading-relaxed">COMMERCIAL RIGHTS</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
