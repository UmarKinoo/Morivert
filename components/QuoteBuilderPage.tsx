
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ProductType = 
  | 'Plain Recycled Paper Pencil'
  | 'Branded Recycled Paper Pencil'
  | 'Branded Plantable Pencil (Seed-Embedded)'
  | 'Coloured Pencils (Box of 10)'
  | 'Coloured Pencil Pouch'
  | 'Branded Recycled Paper Pen'
  | 'Customised Plantable Notebook (A5)'
  | 'Plantable Business Card'
  | 'Plantable Wedding Card (A5)';

type CategoryType = 'Writing' | 'Sets' | 'Stationery';

const PRODUCT_CATEGORIES: Record<CategoryType, ProductType[]> = {
  'Writing': [
    'Plain Recycled Paper Pencil',
    'Branded Recycled Paper Pencil',
    'Branded Plantable Pencil (Seed-Embedded)',
    'Branded Recycled Paper Pen'
  ],
  'Sets': [
    'Coloured Pencils (Box of 10)',
    'Coloured Pencil Pouch'
  ],
  'Stationery': [
    'Customised Plantable Notebook (A5)',
    'Plantable Business Card',
    'Plantable Wedding Card (A5)'
  ]
};

const PRODUCT_PRICES: Record<ProductType, number> = {
  'Plain Recycled Paper Pencil': 20,
  'Branded Recycled Paper Pencil': 30,
  'Branded Plantable Pencil (Seed-Embedded)': 40,
  'Coloured Pencils (Box of 10)': 300,
  'Coloured Pencil Pouch': 550,
  'Branded Recycled Paper Pen': 40,
  'Customised Plantable Notebook (A5)': 140,
  'Plantable Business Card': 10,
  'Plantable Wedding Card (A5)': 75
};

export const QuoteBuilderPage: React.FC = () => {
  const [product, setProduct] = useState<ProductType>('Branded Plantable Pencil (Seed-Embedded)');
  const [quantity, setQuantity] = useState(500);
  const [market, setMarket] = useState<'Mauritius' | 'Export'>('Mauritius');
  const [isFocused, setIsFocused] = useState(false);

  const increment = useCallback(() => setQuantity(q => Math.min(10000, q + 50)), []);
  const decrement = useCallback(() => setQuantity(q => Math.max(50, q - 50)), []);

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setQuantity(0);
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      setQuantity(Math.min(10000, num));
    }
  };

  const quote = useMemo(() => {
    const basePrice = PRODUCT_PRICES[product];
    const calcQty = Math.max(1, quantity);
    const discount = calcQty >= 2000 ? 0.15 : calcQty >= 500 ? 0.08 : 0;
    const unitPrice = basePrice * (1 - discount);
    const totalPrice = unitPrice * calcQty;
    
    const baseTimeline = product.toLowerCase().includes('pencil') || product.toLowerCase().includes('pen') ? 7 : 14;
    const marketBuffer = market === 'Export' ? 10 : 0;

    return {
      total: Math.round(totalPrice),
      unit: unitPrice.toFixed(2),
      discountPercent: (discount * 100).toFixed(0),
      timeline: baseTimeline + marketBuffer,
      seeds: product.includes('Plantable') || product.includes('Seed') ? Math.floor(calcQty * 1.5) : 0,
      paperGrams: Math.floor(calcQty * 12.5),
      co2Saved: (calcQty * 0.09).toFixed(1)
    };
  }, [product, quantity, market]);

  return (
    <div className="w-full min-h-screen bg-[#050505] text-zinc-100 font-sans overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-zinc-800/10 blur-[160px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vh] bg-emerald-950/5 blur-[140px] rounded-full -translate-x-1/3 translate-y-1/3" />
      </div>

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 pt-32 pb-40 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start">
          
          {/* Section: Configurator (Left) */}
          <div className="lg:col-span-7 space-y-16">
            <header className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <span className="w-10 h-[1px] bg-zinc-700" />
                <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 font-bold">Configurator v2.0</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-light tracking-tighter leading-[0.95] text-white"
              >
                Build your <br/>
                <span className="text-zinc-600 italic">impact footprint.</span>
              </motion.h1>
              <p className="text-zinc-500 text-sm md:text-base font-light max-w-lg">
                Select your premium writing instruments and let our circular model calculate your environmental contribution in real-time.
              </p>
            </header>

            <div className="space-y-14">
              {/* 1. Product Selection */}
              {Object.entries(PRODUCT_CATEGORIES).map(([cat, items], idx) => (
                <motion.section 
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black">{cat}</span>
                    <div className="h-[1px] flex-1 bg-zinc-900" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <button
                        key={item}
                        onClick={() => setProduct(item)}
                        className={`relative flex flex-col justify-between p-6 rounded-[1.8rem] border text-left transition-all duration-500 group active:scale-[0.98] ${
                          product === item 
                            ? 'bg-zinc-900 border-zinc-700 shadow-2xl' 
                            : 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/40'
                        }`}
                      >
                        <div className={`text-sm md:text-base font-medium transition-colors ${product === item ? 'text-white' : 'text-zinc-400'}`}>
                          {item}
                        </div>
                        <div className="mt-8 flex justify-between items-center">
                          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
                            Rs {PRODUCT_PRICES[item]} <span className="opacity-40">/ pc</span>
                          </span>
                          {product === item && (
                            <motion.div layoutId="p-indicator" className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.section>
              ))}

              {/* 2. Quantity Configuration */}
              <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/50 space-y-12"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="space-y-1">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Quantity & Volume</h3>
                    <p className="text-sm text-zinc-400 font-light italic">Higher volume equals higher earth impact.</p>
                  </div>
                  
                  <div className={`flex items-center gap-4 bg-black p-2 rounded-2xl border transition-colors ${isFocused ? 'border-zinc-500' : 'border-zinc-800'} w-full md:w-auto`}>
                    <button 
                      onClick={decrement}
                      className="w-14 h-14 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-all active:scale-90"
                    >
                      <svg width="20" height="2" viewBox="0 0 20 2" fill="none" stroke="currentColor" strokeWidth="2"><path d="M0 1H20"/></svg>
                    </button>
                    <input 
                      type="number"
                      value={quantity === 0 ? '' : quantity}
                      onChange={handleQuantityInput}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="bg-transparent text-5xl font-light tracking-tighter text-white w-28 md:w-36 outline-none text-center"
                      placeholder="0"
                    />
                    <button 
                      onClick={increment}
                      className="w-14 h-14 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-all active:scale-90"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 0V20M0 10H20"/></svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="relative h-1 bg-zinc-900 rounded-full">
                    <motion.div 
                      initial={false}
                      animate={{ width: `${(quantity / 10000) * 100}%` }}
                      className="absolute top-0 left-0 h-full bg-zinc-200 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    />
                    <input
                      type="range"
                      min="50"
                      max="10000"
                      step="50"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {[100, 500, 2000, 5000].map(val => (
                      <button 
                        key={val}
                        onClick={() => setQuantity(val)}
                        className={`px-6 py-3 rounded-full border text-[10px] uppercase tracking-widest transition-all ${quantity === val ? 'bg-zinc-100 text-black border-zinc-100' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}
                      >
                        {val} Units
                      </button>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* 3. Shipping Destination */}
              <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">Project Destination</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['Mauritius', 'Export'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMarket(m)}
                      className={`py-6 rounded-2xl border text-[11px] uppercase tracking-[0.3em] font-bold transition-all duration-500 active:scale-95 ${
                        market === m 
                          ? 'bg-zinc-100 text-black border-zinc-100 shadow-xl' 
                          : 'bg-zinc-900/30 border-zinc-900 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>

          {/* Section: Sticky Investment Summary (Right) */}
          <div className="lg:col-span-5 relative lg:min-h-screen">
            <div className="lg:sticky lg:top-32 space-y-8 pb-12">
              <motion.div 
                key={product + quantity + market}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 md:p-14 rounded-[3.5rem] bg-zinc-900 border border-zinc-800 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] pointer-events-none" />

                <div className="space-y-12 relative z-10">
                  <header className="space-y-2">
                    <h3 className="text-[10px] uppercase tracking-[0.5em] text-emerald-500 font-black">Estimated Investment</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-7xl md:text-8xl font-light tracking-tighter leading-none text-white">
                        Rs {quote.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-4">
                       <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">~Rs {quote.unit} / Unit</span>
                       {parseInt(quote.discountPercent) > 0 && (
                         <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-tighter">
                           -{quote.discountPercent}% OFF
                         </span>
                       )}
                    </div>
                  </header>

                  <div className="grid grid-cols-2 gap-10 py-10 border-y border-zinc-800/50">
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Estimated Turnaround</div>
                      <div className="text-3xl font-light text-white">~{quote.timeline}<span className="text-sm text-zinc-600 uppercase ml-1">Days</span></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Fulfillment</div>
                      <div className="text-3xl font-light text-white">Direct</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Environmental ROI</h4>
                      <div className="h-[1px] flex-1 ml-6 bg-zinc-800" />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <MetricItem icon="🌱" value={quote.seeds} label="Growth Potential" color="text-emerald-400" />
                      <MetricItem icon="☁️" value={`${quote.co2Saved}kg`} label="Carbon Avoided" color="text-blue-400" />
                      <MetricItem icon="📦" value={`${(quote.paperGrams/1000).toFixed(1)}kg`} label="Upcycled Content" color="text-amber-500" />
                    </div>
                  </div>

                  <div className="pt-6 space-y-4">
                    <button className="w-full bg-white text-black py-7 rounded-[2rem] text-[12px] uppercase tracking-[0.5em] font-black hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl group">
                      Request Formal Quote 
                      <span className="inline-block ml-4 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                    <p className="text-[9px] text-center text-zinc-600 uppercase tracking-widest font-bold">
                      Price includes standard branding and eco-packaging.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <div className="hidden lg:block text-center space-y-4 pt-4 opacity-40">
                 <div className="text-[10px] uppercase tracking-[0.5em] text-zinc-400">Handcrafted in Mauritius</div>
                 <div className="flex justify-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-black/90 backdrop-blur-3xl border-t border-zinc-900 z-[100] lg:hidden">
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-bold">Total Investment</div>
            <div className="text-3xl font-light tracking-tighter leading-none text-white">Rs {quote.total.toLocaleString()}</div>
          </div>
          <div className="text-right">
             <div className="text-emerald-400 text-2xl font-light leading-none">+{quote.seeds}</div>
             <div className="text-[9px] uppercase tracking-widest text-zinc-600 mt-1">Plants Created</div>
          </div>
        </div>
        <button className="w-full bg-emerald-500 text-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.5em] font-black active:scale-[0.97] shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
          Submit Quote Request
        </button>
      </div>

      <footer className="relative w-full py-20 px-6 border-t border-zinc-900 bg-[#050505] z-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-2xl font-light tracking-tighter text-white/40">MORIVERT</div>
           <p className="text-[9px] uppercase tracking-[0.6em] text-zinc-700">Sustainability is not a choice, it is a design.</p>
           <div className="text-[9px] text-zinc-800 uppercase tracking-widest">&copy; 2025 Morivert Mauritius • All rights reserved</div>
         </div>
      </footer>
    </div>
  );
};

const MetricItem = ({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) => (
  <div className="flex items-center gap-5 p-5 bg-zinc-950/40 rounded-[1.8rem] border border-zinc-800/50 group hover:bg-zinc-950/80 transition-all">
    <div className="text-2xl group-hover:rotate-12 transition-transform duration-500">{icon}</div>
    <div className="flex-1">
      <div className={`text-xl font-light tracking-tight ${color}`}>{value.toLocaleString()}</div>
      <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">{label}</div>
    </div>
  </div>
);
