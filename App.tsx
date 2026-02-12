
import React, { Suspense, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment } from '@react-three/drei';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { Header } from './components/Header';
import { ImmersiveCalculatorPage } from './components/ImmersiveCalculatorPage';

export type TextureType = 
  | 'cedar' | 'etched' | 'nebula' | 'prism' | 'vibrant' 
  | 'mori' | 'mori-ruby' | 'mori-azure' | 'mori-gold' 
  | 'iridescent' | 'aurora';

export type ViewType = 'landing' | 'calculator' | 'quote';

const RANDOM_START_TEXTURES: TextureType[] = ['mori', 'mori-ruby', 'mori-azure', 'mori-gold', 'nebula'];

const Color = 'color' as any;
const AmbientLight = 'ambientLight' as any;
const SpotLight = 'spotLight' as any;

function App() {
  const navigate = useNavigate();
  const [texture, setTexture] = useState<TextureType>(
    () => RANDOM_START_TEXTURES[Math.floor(Math.random() * RANDOM_START_TEXTURES.length)]
  );
  const [view, setView] = useState<ViewType>('landing');
  const [scrollPages, setScrollPages] = useState(10);

  const handleOverlayHeight = useCallback((heightPx: number) => {
    if (heightPx <= 0) return;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    const pages = Math.max(1, heightPx / vh) || 10;
    setScrollPages(pages);
  }, []);

  return (
    <div
      className={`w-full min-h-screen bg-neutral-950 ${view === 'landing' ? 'h-screen overflow-hidden' : 'overflow-y-auto'}`}
      style={view === 'landing' ? { touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' } : undefined}
    >
      <Header setView={setView} currentView={view} />
      
      {view === 'landing' && (
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 35 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          style={{ touchAction: 'none' }}
        >
          <Color attach="background" args={['#050505']} />
          <Suspense fallback={null}>
            <ScrollControls
              pages={scrollPages}
              damping={0.2}
              style={{
                touchAction: 'pan-y',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <Experience texture={texture} />
              <Scroll html>
                <Overlay currentTexture={texture} onTextureChange={setTexture} setView={setView} onNavigate={navigate} onContentHeight={handleOverlayHeight} />
              </Scroll>
            </ScrollControls>
            <Environment preset="studio" intensity={0.5} />
            <AmbientLight intensity={0.2} />
            <SpotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          </Suspense>
        </Canvas>
      )}

      {view === 'calculator' && <ImmersiveCalculatorPage />}

    </div>
  );
}

export default App;
