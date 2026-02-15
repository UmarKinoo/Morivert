import React, { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment } from '@react-three/drei';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { Header } from './components/Header';
import { GrainOverlay } from './components/GrainOverlay';
import { ImmersiveCalculatorPage } from './components/ImmersiveCalculatorPage';

const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

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
  const isMobile = useIsMobile();
  const [texture, setTexture] = useState<TextureType>(
    () => RANDOM_START_TEXTURES[Math.floor(Math.random() * RANDOM_START_TEXTURES.length)]
  );
  const [view, setView] = useState<ViewType>('landing');
  const [scrollPages, setScrollPages] = useState(10);

  // Use the same container ScrollControls uses (gl.domElement.parentNode). On real
  // mobile, 100vh/layout height can be larger than window.innerHeight, so using
  // innerHeight made pages too high and allowed scroll past the footer.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentHeightRef = useRef(0);

  const updateScrollPages = useCallback(() => {
    const content = contentHeightRef.current;
    if (content <= 0) return;
    const containerHeight = scrollContainerRef.current?.clientHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 900);
    const pages = Math.max(1, content / containerHeight) || 10;
    setScrollPages(pages);
  }, []);

  const handleOverlayHeight = useCallback((heightPx: number) => {
    if (heightPx <= 0) return;
    contentHeightRef.current = heightPx;
    const containerHeight = scrollContainerRef.current?.clientHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 900);
    const pages = Math.max(1, heightPx / containerHeight) || 10;
    setScrollPages(pages);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (contentHeightRef.current > 0) updateScrollPages();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollPages]);

  return (
    <div
      className={`w-full min-h-screen bg-neutral-950 flex flex-col ${view === 'landing' ? 'h-screen overflow-hidden' : 'overflow-y-auto'}`}
      style={view === 'landing' ? { touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' } : undefined}
    >
      <Header setView={setView} currentView={view} />
      {/* Keep Canvas mounted but hidden to avoid ScrollControls style-on-null crash during unmount */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 min-h-0 flex flex-col"
        style={view !== 'landing' ? { display: 'none' } : undefined}
      >
        <Canvas
          className="flex-1 min-h-0"
          shadows={!isMobile}
          camera={{ position: [0, 0, 5], fov: 35 }}
          gl={{
            antialias: !isMobile,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          dpr={isMobile ? 1 : [1, 2]}
          style={{ touchAction: 'none', position: 'relative', zIndex: 0 }}
          frameloop={view === 'landing' ? 'always' : 'never'}
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
              <Experience texture={texture} isMobile={isMobile} />
              <Scroll html>
                <Overlay currentTexture={texture} onTextureChange={setTexture} setView={setView} onNavigate={navigate} onContentHeight={handleOverlayHeight} />
              </Scroll>
            </ScrollControls>
            {isMobile ? (
              <>
                <AmbientLight intensity={0.5} />
                <SpotLight position={[5, 8, 5]} angle={0.4} penumbra={0.5} intensity={0.8} />
              </>
            ) : (
              <>
                <Environment preset="studio" intensity={0.5} />
                <AmbientLight intensity={0.2} />
                <SpotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              </>
            )}
          </Suspense>
        </Canvas>
        {isMobile && <GrainOverlay />}
      </div>

      {view === 'calculator' && <ImmersiveCalculatorPage />}

    </div>
  );
}

export default App;
