
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ViewType } from '../App';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  setView: (view: ViewType) => void;
  currentView: ViewType;
}

export const Header: React.FC<HeaderProps> = ({ setView, currentView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  const isQuotePage = location.pathname === '/quote';
  const isLanding = !isQuotePage && currentView === 'landing';
  const isCalculator = !isQuotePage && currentView === 'calculator';

  const goHome = () => {
    if (isQuotePage || location.pathname !== '/') navigate('/');
    else setView('landing');
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <header className="fixed top-0 left-0 w-full z-[100] px-10 py-8 flex justify-between items-center mix-blend-difference">
      <div 
        className="text-xl font-medium tracking-tighter cursor-pointer" 
        onClick={goHome}
      >
        MORIVERT
      </div>
      
      <nav className="hidden md:flex items-center gap-12 text-[11px] uppercase tracking-[0.2em] font-light text-white/70">
        <button 
          onClick={() => (isQuotePage ? navigate('/') : setView('landing'))} 
          className={`hover:text-white transition-colors ${isLanding ? 'text-white underline underline-offset-8' : ''}`}
        >
          Product
        </button>
        <button 
          onClick={() => (isQuotePage ? navigate('/') : setView('calculator'))} 
          className={`hover:text-white transition-colors ${isCalculator ? 'text-white underline underline-offset-8' : ''}`}
        >
          Impact
        </button>
        <button 
          onClick={() => navigate('/quote')} 
          className={`hover:text-white transition-colors ${isQuotePage ? 'text-white underline underline-offset-8' : ''}`}
        >
          Get Quote
        </button>

        {user ? (
          <>
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-white transition-colors"
            >
              My Quotes
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all text-white"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="max-w-[80px] truncate normal-case tracking-normal text-[11px]">
                {displayName.split(' ')[0]}
              </span>
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all text-white"
          >
            Sign In
          </button>
        )}
      </nav>

      <div className="md:hidden flex items-center gap-4">
        {user ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-white/20 px-3 py-1 rounded"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
            ) : null}
            Quotes
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-[10px] uppercase tracking-widest border border-white/20 px-3 py-1 rounded"
          >
            Sign In
          </button>
        )}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
    </header>
  );
};
