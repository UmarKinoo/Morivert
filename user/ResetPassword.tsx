import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = location.hash || '';
    const isRecovery = hash.includes('type=recovery');
    // Supabase recovers session from URL hash when type=recovery. Show form when link is present.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(isRecovery);
      if (session && !isRecovery) {
        navigate('/dashboard', { replace: true });
      }
    });
  }, [location.hash, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    navigate('/dashboard', { replace: true });
    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="text-xl font-medium tracking-tight text-white mb-2">MORIVERT</div>
          <p className="text-sm text-zinc-500 mb-6">
            Use the link from your password reset email to set a new password.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-xl font-medium tracking-tight text-white mb-2">MORIVERT</div>
          <p className="text-sm text-zinc-500">Set a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            <p className="mt-1.5 text-[11px] text-zinc-600">At least 6 characters</p>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 text-black text-sm font-semibold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-6 w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
};
