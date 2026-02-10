
import React from 'react';
import { ViewType } from '../App';

interface HeaderProps {
  setView: (view: ViewType) => void;
  currentView: ViewType;
}

export const Header: React.FC<HeaderProps> = ({ setView, currentView }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-[100] px-10 py-8 flex justify-between items-center mix-blend-difference">
      <div 
        className="text-xl font-medium tracking-tighter cursor-pointer" 
        onClick={() => setView('landing')}
      >
        MORIVERT
      </div>
      
      <nav className="hidden md:flex items-center gap-12 text-[11px] uppercase tracking-[0.2em] font-light text-white/70">
        <button 
          onClick={() => setView('landing')} 
          className={`hover:text-white transition-colors ${currentView === 'landing' ? 'text-white underline underline-offset-8' : ''}`}
        >
          Product
        </button>
        <button 
          onClick={() => setView('calculator')} 
          className={`hover:text-white transition-colors ${currentView === 'calculator' ? 'text-white underline underline-offset-8' : ''}`}
        >
          Impact
        </button>
        <button 
          onClick={() => setView('quote')} 
          className={`hover:text-white transition-colors ${currentView === 'quote' ? 'text-white underline underline-offset-8' : ''}`}
        >
          Get Quote
        </button>
        <a href="#" className="hover:text-white transition-colors">Story</a>
        <button className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all text-white">
          Reserve
        </button>
      </nav>

      <div className="md:hidden flex items-center gap-4">
         <button onClick={() => setView('quote')} className="text-[10px] uppercase tracking-widest border border-white/20 px-3 py-1 rounded">Quote</button>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
    </header>
  );
};
