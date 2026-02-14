
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { NavigateFunction } from 'react-router-dom';
import { TextureType, ViewType } from '../App';
import { ImpactCalculator } from './ImpactCalculator';

const Section: React.FC<{ children: React.ReactNode; className?: string; light?: boolean }> = ({ children, className = "", light = false }) => (
  <section className={`min-h-screen flex flex-col justify-center px-10 md:px-24 py-20 ${light ? 'bg-[#fafafa] text-neutral-900' : ''} ${className}`}>
    <div className="max-w-7xl mx-auto w-full">
      {children}
    </div>
  </section>
);

const Counter = ({ value, label, icon, light }: { value: string; label: string; icon: string; light?: boolean }) => (
  <div className={`flex flex-col items-center p-8 rounded-3xl ${light ? 'bg-white border border-neutral-200 shadow-sm' : 'bg-white/[0.02] border border-white/5 backdrop-blur-xl'}`}>
    <div className="text-2xl mb-4">{icon}</div>
    <div className={`text-4xl font-light tracking-tighter mb-1 ${light ? 'text-neutral-900' : ''}`}>{value}</div>
    <div className={`text-[9px] uppercase tracking-[0.3em] font-medium text-center ${light ? 'text-neutral-500' : 'text-neutral-500'}`}>{label}</div>
  </div>
);

const ProductIllustration = ({ type }: { type: string }) => {
  switch (type) {
    case 'pencil':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
          <rect x="58" y="20" width="4" height="60" rx="2" fill="#a3a3a3" />
          <path d="M54 80L60 92L66 80H54Z" fill="#a3a3a3" />
          <circle cx="60" cy="25" r="6" fill="#10b981" fillOpacity="0.3" />
          <circle cx="60" cy="25" r="3" fill="#10b981" />
        </svg>
      );
    case 'notebook':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
          <rect x="35" y="30" width="50" height="65" rx="4" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1" />
          <rect x="42" y="45" width="36" height="1" fill="#e5e5e5" />
          <rect x="42" y="55" width="36" height="1" fill="#e5e5e5" />
          <rect x="42" y="65" width="36" height="1" fill="#e5e5e5" />
          <circle cx="85" cy="30" r="8" fill="#10b981" fillOpacity="0.15" />
          <path d="M82 30C82 28 84 27 85 27C86 27 88 28 88 30" stroke="#10b981" strokeWidth="1" />
        </svg>
      );
    case 'calendar':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
          <rect x="30" y="35" width="60" height="50" rx="4" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1" />
          <rect x="30" y="35" width="60" height="12" rx="4" fill="#e5e5e5" />
          <circle cx="40" cy="55" r="2" fill="#d4d4d4" />
          <circle cx="50" cy="55" r="2" fill="#d4d4d4" />
          <circle cx="60" cy="55" r="2" fill="#10b981" />
          <circle cx="70" cy="55" r="2" fill="#d4d4d4" />
        </svg>
      );
    case 'invitation':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
          <path d="M30 40L60 65L90 40V80H30V40Z" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1" />
          <path d="M30 40L60 65L90 40" stroke="#d4d4d4" strokeWidth="1" />
          <circle cx="60" cy="65" r="5" fill="#10b981" fillOpacity="0.2" />
          <path d="M58 65C58 63 59 62 60 62C61 62 62 63 62 65" stroke="#10b981" strokeWidth="1" />
        </svg>
      );
    case 'pen':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
          <rect x="57" y="25" width="6" height="70" rx="3" fill="#a3a3a3" stroke="#d4d4d4" strokeWidth="1" />
          <rect x="57" y="35" width="6" height="2" fill="#d4d4d4" />
          <circle cx="60" cy="95" r="2" fill="#d4d4d4" />
          <path d="M57 30H63" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

interface OverlayProps {
  currentTexture: TextureType;
  onTextureChange: (type: TextureType) => void;
  setView: (view: ViewType) => void;
  onNavigate?: NavigateFunction;
  onContentHeight?: (heightPx: number) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ currentTexture, onTextureChange, setView, onNavigate, onContentHeight }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onContentHeight || !rootRef.current) return;
    const el = rootRef.current;
    const measure = () => {
      const h = el.scrollHeight;
      if (h > 0) onContentHeight(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onContentHeight]);

  const textures = [
    { id: 'mori', name: 'Mori Green', icon: '🌿' },
    { id: 'mori-ruby', name: 'Mori Ruby', icon: '🍷' },
    { id: 'mori-azure', name: 'Mori Azure', icon: '🌊' },
    { id: 'mori-gold', name: 'Mori Gold', icon: '✨' },
    { id: 'aurora', name: 'Aurora', icon: '🌌' },
    { id: 'iridescent', name: 'Iridis', icon: '💎' },
    { id: 'nebula', name: 'Nebula', icon: '🔭' },
    { id: 'prism', name: 'Prism', icon: '🌈' },
    { id: 'vibrant', name: 'Vibrant', icon: '🎨' },
    { id: 'cedar', name: 'Cedar', icon: '🌲' },
    { id: 'etched', name: 'Etched', icon: '📐' },
  ];

  const awards = [
    { title: "Climate Launchpad", desc: "Global winner for sustainable innovation." },
    { title: "PwC Sustainability", desc: "Recognized for climate-positive business model." },
    { title: "National Innovation", desc: "Top honors in national technology challenge." },
    { title: "Mandela Fellowship", desc: "Recognized for social and environmental leadership." }
  ];

  const partnershipLogos = [
    { src: '/partnerships/pepsi2.png', name: 'Pepsi' },
    { src: '/partnerships/airfrance.png', name: 'Air France' },
    { src: '/partnerships/beachcomber.png', name: 'Beachcomber' },
    { src: '/partnerships/ccare.png', name: 'C-Care' },
    { src: '/partnerships/chamarel.png', name: 'Chamarel' },
    { src: '/partnerships/currimjee.png', name: 'Currimjee' },
    { src: '/partnerships/iom.png', name: 'IOM' },
    { src: '/partnerships/MPTP.png', name: 'MPTP' },
    { src: '/partnerships/phoenix-mall.png', name: 'Phoenix Mall' },
    { src: '/partnerships/royal-kids.png', name: 'Royal Kids' },
    { src: '/partnerships/sbm.png', name: 'SBM' },
    { src: '/partnerships/taylorsmith.png', name: 'Taylor Smith' },
  ];

  const products = [
    { name: "Plantable Pencils", type: "pencil", tagline: "The flagship circular tool." },
    { name: "Plantable Notebooks", type: "notebook", tagline: "Pages that become petals." },
    { name: "Plantable Calendars", type: "calendar", tagline: "Time that grows back." },
    { name: "Invitation Cards", type: "invitation", tagline: "Events that leave a legacy." },
    { name: "Paper Pens", type: "pen", tagline: "Upcycled precision writing." }
  ];

  return (
    <div ref={rootRef} className="w-screen">
      {/* 1. Hero — text left ~45%, pencil right ~55% */}
      <section className="min-h-screen flex flex-col justify-center px-10 md:px-24 py-20 relative">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ margin: "-10%" }}
            className="space-y-6 md:space-y-8 max-w-xl md:max-w-2xl"
          >
            <h1 className="text-[clamp(2.4rem,5.5vw,5rem)] font-extralight tracking-[-0.04em] leading-[1.08]">
              Designed to Be Used.
              <br />
              Made to Be Planted.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/40 font-light max-w-md leading-relaxed tracking-tight">
              Plantable stationery made from recycled paper&nbsp;— customised for brands, schools, and institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => setView('calculator')}
                className="bg-white text-black px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-[13px] tracking-wide font-medium hover:bg-white/90 transition-colors"
              >
                Calculate Your Impact
              </button>
              <button
                onClick={() => (onNavigate ? onNavigate('/quote') : setView('quote'))}
                className="bg-white/10 text-white/90 border border-white/15 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-[13px] tracking-wide font-medium hover:bg-white/15 transition-colors backdrop-blur-sm"
              >
                Get an Instant Quote
              </button>
            </div>
          </motion.div>
        </div>
        {/* Scroll indicator — pinned to bottom of hero viewport */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 md:bottom-12 left-10 md:left-24 text-[10px] tracking-[0.25em] uppercase font-light text-white/30"
        >
          Scroll to explore
        </motion.p>
      </section>

      {/* 2. Bold Statement */}
      <Section className="items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="space-y-4 md:space-y-6"
        >
          <div className="text-[12px] uppercase tracking-[0.5em] text-emerald-400 font-bold mb-8">The Philosophy</div>
          <h2 className="text-4xl md:text-7xl font-light tracking-tighter leading-tight">
            We do not sell stationery.<br />
            <span className="italic font-serif text-emerald-500/80">We sell plants.</span><br />
            We sell impact.<br />
            <span className="font-medium text-white">We sell the future.</span>
          </h2>
        </motion.div>
      </Section>

      {/* 3. Awards & Credibility — WHITE (tighter bottom so Partnerships feels connected) */}
      <Section light className="!pb-12 md:!pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs uppercase tracking-[0.4em] text-emerald-600 font-semibold">Credibility</h3>
            <h2 className="text-4xl font-light tracking-tight text-neutral-900">Awards & <br/><span className="italic font-serif">Recognition.</span></h2>
            <p className="text-sm text-neutral-500 font-light">Validated by global leaders in sustainability and innovation.</p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {awards.map((a, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, borderColor: 'rgba(0,0,0,0.15)' }}
                className="p-8 bg-white border border-neutral-200 rounded-3xl transition-all cursor-default group shadow-sm"
              >
                <div className="text-lg font-medium mb-2 text-neutral-900 group-hover:text-emerald-600 transition-colors">{a.title}</div>
                <div className="text-[11px] text-neutral-500 uppercase tracking-widest leading-relaxed">{a.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* 3b. Partnerships — logo slider (tighter top to pair with Awards) */}
      <Section light className="!pt-10 md:!pt-12 !pb-12 md:!pb-16">
        <div className="w-full">
          <h3 className="text-xs uppercase tracking-[0.4em] text-emerald-600 font-semibold mb-2">Trusted by</h3>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-neutral-900 mb-10 md:mb-12">Partnerships.</h2>
          <div className="overflow-hidden w-full -mx-10 md:-mx-24">
            <div
              className="flex w-max gap-10 md:gap-16 items-center"
              style={{
                animation: 'partnerships-marquee 40s linear infinite',
                width: 'max-content',
              }}
            >
              {[...partnershipLogos, ...partnershipLogos].map((logo, i) => (
                <div
                  key={`${logo.name}-${i}`}
                  className="flex-shrink-0 flex items-center justify-center w-[180px] md:w-[220px] h-[80px] md:h-[100px] grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 4. Seed Capsule Close-up */}
      <Section className="items-end text-right">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            A Living Capsule.
          </h2>
          <p className="text-base md:text-lg text-neutral-400 font-light max-w-sm ml-auto">
            A premium cellulose window protects non-GMO seeds, waiting for their moment to transform.
          </p>
        </motion.div>
      </Section>

      {/* 5. Live Counters — WHITE */}
      <Section light>
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-light tracking-tight text-neutral-900">Global Footprint.</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Updated in real time. Impact created with every order.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Counter icon="✏️" value="250k+" label="Pencils Sold" light />
          <Counter icon="📄" value="4.2t" label="Paper Recycled" light />
          <Counter icon="🌱" value="310k" label="Plants Planted" light />
          <Counter icon="👧🏽" value="12k" label="Kids Sensitised" light />
          <Counter icon="🏆" value="12" label="Awards Won" light />
        </div>
      </Section>

      {/* 6. Pattern Selection */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            Chromatic Life.
          </h2>
          <p className="text-base md:text-lg text-neutral-400 font-light max-w-sm mb-10">
            From deep organic forests to iridescent cosmic clouds. Choose a pattern that reflects your story.
          </p>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3">
            {textures.map((t) => (
              <button
                key={t.id}
                onClick={() => onTextureChange(t.id as TextureType)}
                className={`group flex flex-col items-center gap-2 transition-all duration-500 p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] ${currentTexture === t.id ? 'opacity-100 scale-105 border-white/20' : 'opacity-40 hover:opacity-70'}`}
              >
                <div className={`text-xl`}>{t.icon}</div>
                <span className="text-[7px] uppercase tracking-widest font-bold text-center">{t.name}</span>
                <div className={`w-full h-0.5 mt-1 rounded-full transition-all duration-500 ${currentTexture === t.id ? 'bg-white scale-x-100' : 'bg-transparent scale-x-0'}`} />
              </button>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* 7. Product Grid — WHITE */}
      <Section light>
        <div className="space-y-4 mb-16">
          <h3 className="text-xs uppercase tracking-[0.4em] text-emerald-600 font-bold">Collection</h3>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-neutral-900 leading-tight">
            All Plantable. <br/>
            <span className="italic font-serif text-neutral-400">All Circular.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12 }}
              className="relative p-10 bg-white border border-neutral-200 rounded-[3rem] flex flex-col items-center justify-between min-h-[420px] text-center group overflow-hidden transition-all duration-700 shadow-sm hover:shadow-xl"
            >
              <div className="relative z-10 transition-transform duration-700 group-hover:scale-110">
                <ProductIllustration type={p.type} />
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="space-y-1">
                  <div className="text-base font-medium tracking-tight text-neutral-900">{p.name}</div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-light">{p.tagline}</div>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={() => (onNavigate ? onNavigate('/quote') : setView('quote'))}
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-emerald-600 group/btn"
                  >
                    Configure
                    <span className="w-4 h-[1px] bg-emerald-600/30 group-hover/btn:w-8 transition-all" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 8. Impact Calculator */}
      <Section className="items-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full"
        >
          <ImpactCalculator isVisible={true} />
        </motion.div>
      </Section>

      {/* 9. Final CTA */}
      <Section className="items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="max-w-3xl mx-auto"
        >
          <span className="text-emerald-400 text-sm tracking-[0.3em] uppercase mb-6 block font-medium">Ready to Grow Impact?</span>
          <h2 className="text-6xl md:text-8xl font-light tracking-tighter mb-12">
            Morivert.
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => (onNavigate ? onNavigate('/quote') : setView('quote'))}
              className="bg-white text-black px-12 py-5 rounded-full text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-200 transition-all shadow-2xl w-full md:w-auto"
            >
              Get Instant Quote
            </button>
            <button 
              onClick={() => setView('calculator')}
              className="bg-white/5 text-white border border-white/10 px-12 py-5 rounded-full text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white/10 transition-all w-full md:w-auto"
            >
              Calculate My Impact
            </button>
          </div>
        </motion.div>
      </Section>

      {/* Footer — WHITE, last section; height is content-only. Scroll math in App.tsx already ensures page bottom = viewport bottom (no gap). */}
      <footer className="bg-[#fafafa] text-neutral-900 w-screen flex flex-col">
        <div className="max-w-7xl mx-auto px-10 md:px-24 py-16 md:py-24 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="space-y-4">
              <div className="text-xl font-medium tracking-tight text-neutral-900">MORIVERT</div>
              <p className="text-sm text-neutral-500 font-light leading-relaxed max-w-xs">
                Circular stationery that grows back. Handcrafted in Mauritius.
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-4">Products</div>
              <div className="text-sm text-neutral-600 font-light">Plantable Pencils</div>
              <div className="text-sm text-neutral-600 font-light">Plantable Notebooks</div>
              <div className="text-sm text-neutral-600 font-light">Calendars & Cards</div>
              <div className="text-sm text-neutral-600 font-light">Paper Pens</div>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-4">Company</div>
              <div className="text-sm text-neutral-600 font-light">Our Story</div>
              <div className="text-sm text-neutral-600 font-light">Impact Report</div>
              <div className="text-sm text-neutral-600 font-light">Awards</div>
              <div className="text-sm text-neutral-600 font-light">Contact</div>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-4">Promise</div>
              <div className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-neutral-500">
                <div><span className="text-neutral-900 font-bold">Custom-made</span> — Tailored for your brand</div>
                <div><span className="text-neutral-900 font-bold">No Minimum</span> — Scalable for any need</div>
                <div><span className="text-neutral-900 font-bold">Climate Positive</span> — Regenerative by design</div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-neutral-400">© 2025 Morivert Mauritius. All rights reserved.</p>
            <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-light">Sustainability is not a choice, it is a design.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
