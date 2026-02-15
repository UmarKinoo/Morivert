import React, { useEffect, useState, useRef } from 'react';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuDesktopRef = useRef<HTMLDivElement>(null);
  const userMenuMobileRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = userMenuDesktopRef.current?.contains(target);
      const insideMobile = userMenuMobileRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) setUserMenuOpen(false);
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name || user?.email || '';

  const closeAnd = (fn: () => void) => {
    setUserMenuOpen(false);
    fn();
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await supabase.auth.signOut();
    navigate('/');
  };

  const userMenuItems = user ? (
    <div
      ref={userMenuDesktopRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setUserMenuOpen((o) => !o)}
        className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all text-white"
        aria-expanded={userMenuOpen}
        aria-haspopup="true"
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
        <svg
          className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {userMenuOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-zinc-900/95 backdrop-blur border border-zinc-700/80 shadow-xl py-2 z-[200] mix-blend-normal"
          role="menu"
        >
          <div className="px-4 py-2.5 border-b border-zinc-700/80">
            <p className="text-xs font-medium text-white truncate">{displayName}</p>
            <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => closeAnd(() => navigate('/dashboard'))}
              className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              role="menuitem"
            >
              My Quotes
            </button>
            <button
              type="button"
              onClick={() => closeAnd(() => navigate('/profile'))}
              className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              role="menuitem"
            >
              Profile & account
            </button>
            <button
              type="button"
              onClick={() => closeAnd(() => navigate('/quote'))}
              className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              role="menuitem"
            >
              Get Quote
            </button>
          </div>
          <div className="border-t border-zinc-700/80 py-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <button
      onClick={() => navigate('/login')}
      className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all text-white"
    >
      Sign In
    </button>
  );

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
          userMenuItems
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
          <div ref={userMenuMobileRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-white/20 px-3 py-2 rounded text-white/90"
              aria-expanded={userMenuOpen}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="normal-case">Account</span>
              <svg
                className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-zinc-900/95 backdrop-blur border border-zinc-700/80 shadow-xl py-2 z-[200] mix-blend-normal">
                <div className="px-4 py-2 border-b border-zinc-700/80">
                  <p className="text-xs font-medium text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => closeAnd(() => navigate('/dashboard'))}
                    className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800"
                  >
                    My Quotes
                  </button>
                  <button
                    type="button"
                    onClick={() => closeAnd(() => navigate('/profile'))}
                    className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => closeAnd(() => navigate('/quote'))}
                    className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800"
                  >
                    Get Quote
                  </button>
                </div>
                <div className="border-t border-zinc-700/80">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-400 hover:bg-zinc-800"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
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
