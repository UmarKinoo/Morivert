
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImpactCalculatorProps {
  isVisible: boolean;
}

const AnimatedNumber = ({ value, label, unit = "" }: { value: number; label: string; unit?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    const duration = 1000;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (end - start) * easeOutExpo);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  return (
    <div className="flex flex-col items-center p-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-500 group">
      <div className="text-3xl md:text-5xl font-light tracking-tighter text-white mb-2 group-hover:scale-105 transition-transform duration-500">
        {displayValue.toLocaleString()}{unit}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
        {label}
      </div>
    </div>
  );
};

export const ImpactCalculator: React.FC<ImpactCalculatorProps> = ({ isVisible }) => {
  const [quantity, setQuantity] = useState(100);
  const [productType, setProductType] = useState<'pencil' | 'notepad' | 'pen'>('pencil');
  const [custom, setCustom] = useState(false);

  const impact = useMemo(() => {
    const base = quantity;
    const multiplier = productType === 'pencil' ? 1 : productType === 'notepad' ? 5 : 1.5;
    const customMod = custom ? 1.2 : 1;

    return {
      seeds: Math.floor(base * multiplier),
      paper: Math.floor(base * 0.5 * multiplier),
      co2: Math.floor(base * 0.8 * multiplier * customMod),
      trees: Math.floor(base * 0.02 * multiplier),
      children: Math.floor(base / 25 * multiplier)
    };
  }, [quantity, productType, custom]);

  return (
    <div className="w-full max-w-5xl mx-auto py-20 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-semibold">Impact Calculator</h3>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-tight">
              Visualize your <br/><span className="italic font-serif">positive footprint.</span>
            </h2>
          </div>

          <div className="space-y-8 p-8 bg-white/[0.02] rounded-3xl border border-white/5 backdrop-blur-md">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Product Type</label>
              <div className="flex gap-2">
                {(['pencil', 'notepad', 'pen'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setProductType(type)}
                    className={`flex-1 py-3 text-[10px] uppercase tracking-widest rounded-lg border transition-all duration-300 ${
                      productType === type 
                        ? 'bg-white text-black border-white' 
                        : 'border-white/10 text-white hover:border-white/30'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Quantity</label>
                <span className="text-xl font-light">{quantity}</span>
              </div>
              <input
                type="range"
                min="10"
                max="5000"
                step="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Customization</label>
                <p className="text-[9px] text-neutral-500 uppercase">Logo Engraving & Custom Packaging</p>
              </div>
              <button
                onClick={() => setCustom(!custom)}
                className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${
                  custom ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                  custom ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <AnimatedNumber value={impact.seeds} label="Seeds Planted" />
          </div>
          <AnimatedNumber value={impact.paper} label="Paper Saved" unit="g" />
          <AnimatedNumber value={impact.co2} label="CO₂ Avoided" unit="g" />
          <AnimatedNumber value={impact.trees} label="Trees Saved" />
          <AnimatedNumber value={impact.children} label="Children Impacted" />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="col-span-2 mt-6 py-6 bg-emerald-500 text-black text-[11px] uppercase tracking-[0.2em] font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
          >
            Download My Impact Report
          </motion.button>
        </div>
      </div>
    </div>
  );
};
