import React, { useState, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, OrbitControls, ContactShadows, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ImpactModels } from './ImpactModels';
import { supabase } from '../lib/supabase';
import { generateImpactReportPDF } from '../lib/generateImpactReportPDF';

const PENDING_IMPACT_KEY = 'morivert_pending_impact_report';

// Fix: Use capitalized constants to bypass missing JSX intrinsic types
const Color = 'color' as any;
const Fog = 'fog' as any;
const AmbientLight = 'ambientLight' as any;
const SpotLight = 'spotLight' as any;

export const ImmersiveCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(500);
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
    <div className="w-full h-screen bg-[#0a0a0a] flex flex-col md:flex-row overflow-hidden pt-20">
      {/* Sidebar UI */}
      <div className="w-full md:w-[400px] lg:w-[450px] h-full p-8 md:p-12 z-10 overflow-y-auto border-r border-white/5 bg-[#050505]/50 backdrop-blur-3xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-10"
        >
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.4em] text-emerald-400 font-semibold">Immersive Tool</h3>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight leading-tight text-white">
              Model your <br/><span className="italic font-serif">global impact.</span>
            </h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Select Medium</label>
              <div className="grid grid-cols-3 gap-2">
                {(['pencil', 'notepad', 'pen'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setProductType(type)}
                    className={`py-3 text-[9px] uppercase tracking-widest rounded-xl border transition-all duration-500 ${
                      productType === type 
                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                        : 'border-white/10 text-white/50 hover:border-white/30'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Volume</label>
                <span className="text-2xl font-light text-white">{quantity.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="50"
                max="10000"
                step="50"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Customization</label>
                  <p className="text-[8px] text-neutral-500 uppercase">Enhanced Impact Verification</p>
                </div>
                <button
                  onClick={() => setCustom(!custom)}
                  className={`w-10 h-5 rounded-full transition-colors duration-500 relative ${
                    custom ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-500 ${
                    custom ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
               <MetricCard value={impact.seeds} label="Seeds" color="text-emerald-400" />
               <MetricCard value={impact.trees} label="Trees Saved" color="text-emerald-400" />
               <MetricCard value={impact.co2} label="CO2 (kg)" unit="kg" color="text-blue-400" />
               <MetricCard value={impact.children} label="Kids Helped" color="text-amber-400" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#fff', color: '#000' }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                const payload = { quantity, productType, custom, impact };
                if (!user) {
                  sessionStorage.setItem(PENDING_IMPACT_KEY, JSON.stringify(payload));
                  navigate('/login?returnTo=/dashboard');
                  return;
                }
                generateImpactReportPDF({
                  quantity,
                  productType,
                  custom,
                  seeds: impact.seeds,
                  paper: impact.paper,
                  co2: impact.co2,
                  trees: impact.trees,
                  children: impact.children,
                });
              }}
              className="w-full py-5 border border-white/20 text-white text-[10px] uppercase tracking-[0.3em] font-bold rounded-2xl transition-all duration-500"
            >
              Generate Impact Report
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* 3D Visualization Area */}
      <div className="flex-1 relative bg-gradient-to-b from-neutral-900 to-black">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/30">Live Visualization</p>
        </div>

        <Canvas
          shadows
          camera={{ position: [8, 8, 8], fov: 40 }}
          dpr={[1, 2]}
        >
          {/* Fix: Using capitalized constant Color */}
          <Color attach="background" args={['#050505']} />
          {/* Fix: Using capitalized constant Fog */}
          <Fog attach="fog" args={['#050505', 10, 25]} />
          
          <Suspense fallback={null}>
            <OrbitControls 
              enableZoom={true} 
              autoRotate 
              autoRotateSpeed={0.5} 
              maxPolarAngle={Math.PI / 2.1} 
              minDistance={5}
              maxDistance={15}
            />
            
            <Environment preset="forest" intensity={0.5} />
            {/* Fix: Using capitalized constants for lights */}
            <AmbientLight intensity={0.2} />
            <SpotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
            
            <ImpactModels impact={impact} />
            
            <ContactShadows 
              position={[0, -0.01, 0]} 
              opacity={0.4} 
              scale={20} 
              blur={2} 
              far={4.5} 
            />
          </Suspense>
        </Canvas>

        {/* Floating Legend */}
        <div className="absolute bottom-10 right-10 flex flex-col gap-3 pointer-events-none">
          <LegendItem color="bg-emerald-500" label="Seeds & Growth" />
          <LegendItem color="bg-blue-500" label="Emissions Reduced" />
          <LegendItem color="bg-amber-500" label="Human Impact" />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ value, label, unit = "", color = "" }: any) => (
  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
    <div className={`text-xl font-light tracking-tighter ${color}`}>
      {value.toLocaleString()}{unit}
    </div>
    <div className="text-[8px] uppercase tracking-widest text-neutral-500 mt-1">{label}</div>
  </div>
);

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-full">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-[9px] uppercase tracking-widest text-white/60">{label}</span>
  </div>
);
