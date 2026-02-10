
import React from 'react';
import { motion } from 'framer-motion';
import { TextureType, ViewType } from '../App';
import { ImpactCalculator } from './ImpactCalculator';

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <section className={`min-h-screen flex flex-col justify-center px-10 md:px-24 py-20 max-w-7xl mx-auto ${className}`}>
    {children}
  </section>
);

const Counter = ({ value, label, icon }: { value: string, label: string, icon: string }) => (
  <div className="flex flex-col items-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-xl">
    <div className="text-2xl mb-4">{icon}</div>
    <div className="text-4xl font-light tracking-tighter mb-1">{value}</div>
    <div className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-medium text-center">{label}</div>
  </div>
);

const ProductIllustration = ({ type }: { type: string }) => {
  switch (type) {
    case 'pencil':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
          <rect x="58" y="20" width="4" height="60" rx="2" fill="#444444" />
          <path d="M54 80L60 92L66 80H54Z" fill="#444444" />
          <circle cx="60" cy="25" r="6" fill="#10b981" fillOpacity="0.4" />
          <circle cx="60" cy="25" r="3" fill="#10b981" />
          <path d="M56 25L64 25" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
        </svg>
      );
    case 'notebook':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="35" y="30" width="50" height="65" rx="4" fill="#18181b" stroke="#333" strokeWidth="1" />
          <rect x="42" y="45" width="36" height="1" fill="#333" />
          <rect x="42" y="55" width="36" height="1" fill="#333" />
          <rect x="42" y="65" width="36" height="1" fill="#333" />
          <circle cx="85" cy="30" r="8" fill="#10b981" fillOpacity="0.2" />
          <path d="M82 30C82 28 84 27 85 27C86 27 88 28 88 30" stroke="#10b981" strokeWidth="1" />
        </svg>
      );
    case 'calendar':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="35" width="60" height="50" rx="4" fill="#18181b" stroke="#333" strokeWidth="1" />
          <rect x="30" y="35" width="60" height="12" rx="4" fill="#27272a" />
          <circle cx="40" cy="55" r="2" fill="#444" />
          <circle cx="50" cy="55" r="2" fill="#444" />
          <circle cx="60" cy="55" r="2" fill="#10b981" />
          <circle cx="70" cy="55" r="2" fill="#444" />
        </svg>
      );
    case 'invitation':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 40L60 65L90 40V80H30V40Z" fill="#18181b" stroke="#333" strokeWidth="1" />
          <path d="M30 40L60 65L90 40" stroke="#333" strokeWidth="1" />
          <circle cx="60" cy="65" r="5" fill="#10b981" fillOpacity="0.3" />
          <path d="M58 65C58 63 59 62 60 62C61 62 62 63 62 65" stroke="#10b981" strokeWidth="1" />
        </svg>
      );
    case 'pen':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="57" y="25" width="6" height="70" rx="3" fill="#18181b" stroke="#333" strokeWidth="1" />
          <rect x="57" y="35" width="6" height="2" fill="#333" />
          <circle cx="60" cy="95" r="2" fill="#444" />
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
}

export const Overlay: React.FC<OverlayProps> = ({ currentTexture, onTextureChange, setView }) => {
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

  const products = [
    { name: "Plantable Pencils", type: "pencil", tagline: "The flagship circular tool." },
    { name: "Plantable Notebooks", type: "notebook", tagline: "Pages that become petals." },
    { name: "Plantable Calendars", type: "calendar", tagline: "Time that grows back." },
    { name: "Invitation Cards", type: "invitation", tagline: "Events that leave a legacy." },
    { name: "Paper Pens", type: "pen", tagline: "Upcycled precision writing." }
  ];

  return (
    <div className="w-screen">
      {/* 1. Intro */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ margin: "-10%" }}
        >
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter mb-6 leading-none">
            Write.<br />Plant.<br />Grow.
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 font-light max-w-md">
            Morivert. The world's first circular writing instrument. Designed for the page, destined for the earth.
          </p>
        </motion.div>
      </Section>

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

      {/* 3. Awards & Credibility */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs uppercase tracking-[0.4em] text-emerald-400 font-semibold">Credibility</h3>
            <h2 className="text-4xl font-light tracking-tight text-white">Awards & <br/><span className="italic font-serif">Recognition.</span></h2>
            <p className="text-sm text-neutral-500 font-light">Validated by global leaders in sustainability and innovation.</p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {awards.map((a, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
                className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl transition-all cursor-default group"
              >
                <div className="text-lg font-medium mb-2 group-hover:text-emerald-400 transition-colors">{a.title}</div>
                <div className="text-[11px] text-neutral-500 uppercase tracking-widest leading-relaxed">{a.desc}</div>
              </motion.div>
            ))}
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

      {/* 5. Live Counters */}
      <Section>
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-light tracking-tight text-white">Global Footprint.</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Updated in real time. Impact created with every order.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Counter icon="✏️" value="250k+" label="Pencils Sold" />
          <Counter icon="📄" value="4.2t" label="Paper Recycled" />
          <Counter icon="🌱" value="310k" label="Plants Planted" />
          <Counter icon="👧🏽" value="12k" label="Kids Sensitised" />
          <Counter icon="🏆" value="12" label="Awards Won" />
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

      {/* 7. Product Grid */}
      <Section>
        <div className="space-y-4 mb-16">
          <h3 className="text-xs uppercase tracking-[0.4em] text-emerald-400 font-bold">Collection</h3>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-white leading-tight">
            All Plantable. <br/>
            <span className="italic font-serif text-neutral-500">All Circular.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12, backgroundColor: 'rgba(255,255,255,0.05)' }}
              className="relative p-10 bg-white/[0.03] border border-white/5 rounded-[3rem] flex flex-col items-center justify-between min-h-[420px] text-center group overflow-hidden transition-all duration-700"
            >
              {/* Subtle light effect in background */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 transition-transform duration-700 group-hover:scale-110">
                <ProductIllustration type={p.type} />
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="space-y-1">
                  <div className="text-base font-medium tracking-tight text-white">{p.name}</div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-light">{p.tagline}</div>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={() => setView('quote')}
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400 group/btn"
                  >
                    Configure
                    <span className="w-4 h-[1px] bg-emerald-400/30 group-hover/btn:w-8 transition-all" />
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
          className="max-w-3xl"
        >
          <span className="text-emerald-400 text-sm tracking-[0.3em] uppercase mb-6 block font-medium">Ready to Grow Impact?</span>
          <h2 className="text-6xl md:text-8xl font-light tracking-tighter mb-12">
            Morivert.
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setView('quote')}
              className="bg-white text-black px-12 py-5 rounded-2xl text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-200 transition-all shadow-2xl w-full md:w-auto"
            >
              Get Instant Quote
            </button>
            <button 
              onClick={() => setView('calculator')}
              className="bg-white/5 text-white border border-white/10 px-12 py-5 rounded-2xl text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white/10 transition-all w-full md:w-auto"
            >
              Calculate My Impact
            </button>
            <button className="text-white/60 text-[11px] uppercase tracking-[0.3em] hover:text-white transition-all px-8">
              Contact Us
            </button>
          </div>
          
          <div className="mt-16 pt-12 border-t border-white/5 grid grid-cols-3 gap-8 text-[9px] uppercase tracking-widest text-neutral-500">
            <div className="flex flex-col gap-2">
              <div className="text-white font-bold">Custom-made</div>
              <div>Tailored for your brand</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-white font-bold">No Minimum</div>
              <div>Scalable for any need</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-white font-bold">Climate Positive</div>
              <div>Regenerative by design</div>
            </div>
          </div>
        </motion.div>
      </Section>
    </div>
  );
};
