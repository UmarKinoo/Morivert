
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment } from '@react-three/drei';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { Header } from './components/Header';
import { ImmersiveCalculatorPage } from './components/ImmersiveCalculatorPage';
import { QuoteBuilderPage } from './components/QuoteBuilderPage';

export type TextureType = 
  | 'cedar' | 'etched' | 'nebula' | 'prism' | 'vibrant' 
  | 'mori' | 'mori-ruby' | 'mori-azure' | 'mori-gold' 
  | 'iridescent' | 'aurora';

export type ViewType = 'landing' | 'calculator' | 'quote';

const Color = 'color' as any;
const AmbientLight = 'ambientLight' as any;
const SpotLight = 'spotLight' as any;

function App() {
  const [texture, setTexture] = useState<TextureType>('mori');
  const [view, setView] = useState<ViewType>('landing');

  return (
    <div className={`w-full min-h-screen bg-neutral-950 ${view === 'landing' ? 'h-screen overflow-hidden' : 'overflow-y-auto'}`}>
      <Header setView={setView} currentView={view} />
      
      {view === 'landing' && (
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 35 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Color attach="background" args={['#050505']} />
          <Suspense fallback={null}>
            <ScrollControls pages={9} damping={0.2}>
              <Experience texture={texture} />
              <Scroll html>
                <Overlay currentTexture={texture} onTextureChange={setTexture} setView={setView} />
              </Scroll>
            </ScrollControls>
            <Environment preset="studio" intensity={0.5} />
            <AmbientLight intensity={0.2} />
            <SpotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          </Suspense>
        </Canvas>
      )}

      {view === 'calculator' && <ImmersiveCalculatorPage />}
      
      {view === 'quote' && <QuoteBuilderPage />}

      {view === 'landing' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-40 text-[10px] tracking-[0.2em] uppercase font-light text-white/50">
          Scroll to discover the impact
        </div>
      )}
    </div>
  );
}

export default App;
