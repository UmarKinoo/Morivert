import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type AuthMode = 'signin' | 'signup' | 'magic' | 'forgot';

export const UserLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const isPasswordless = mode === 'magic' || mode === 'forgot';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(returnTo, { replace: true });
    });
  }, [navigate, returnTo]);

  const clearFeedback = () => {
    setError('');
    setMessage('');
  };

  const handleGoogleLogin = async () => {
    clearFeedback();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${returnTo}` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}${returnTo}`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setMessage('Check your email for the sign-in link. It may take a minute.');
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setMessage('Check your email for the password reset link.');
    setLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    if (!email.trim() || (!isPasswordless && !password)) {
      setError(isPasswordless ? 'Please enter your email.' : 'Please enter email and password.');
      return;
    }
    setLoading(true);

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}${returnTo}` },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.user && !data.session) {
        setMessage('Check your email to confirm your account, then sign in.');
        setMode('signin');
      } else if (data.session) {
        navigate(returnTo, { replace: true });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      navigate(returnTo, { replace: true });
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'magic') return handleMagicLink(e);
    if (mode === 'forgot') return handleResetPassword(e);
    return handleEmailSubmit(e);
  };

  const subtitle =
    mode === 'signin'
      ? 'Sign in to get quotes & track orders'
      : mode === 'signup'
        ? 'Create an account'
        : mode === 'magic'
          ? 'We’ll send you a one-time sign-in link'
          : 'We’ll send you a link to reset your password';

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-xl font-medium tracking-tight text-white mb-2">MORIVERT</div>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-[#09090b] px-3 text-zinc-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
            {!isPasswordless && (
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                {mode === 'signup' && (
                  <p className="mt-1.5 text-[11px] text-zinc-600">At least 6 characters</p>
                )}
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); clearFeedback(); }}
                    className="mt-1.5 text-[11px] text-emerald-400 hover:text-emerald-300"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            {message && (
              <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 text-black text-sm font-semibold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                  ? 'Sign in'
                  : mode === 'signup'
                    ? 'Sign up'
                    : mode === 'magic'
                      ? 'Send magic link'
                      : 'Send reset link'}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500">
            {mode === 'signin' && (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => { setMode('signup'); clearFeedback(); }} className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Sign up
                </button>
                {' · '}
                <button type="button" onClick={() => { setMode('magic'); clearFeedback(); }} className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Sign in with magic link
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('signin'); clearFeedback(); }} className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Sign in
                </button>
              </>
            )}
            {mode === 'magic' && (
              <>
                <button type="button" onClick={() => { setMode('signin'); clearFeedback(); }} className="text-emerald-400 hover:text-emerald-300 font-medium">
                  ← Back to password sign in
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <>
                <button type="button" onClick={() => { setMode('signin'); clearFeedback(); }} className="text-emerald-400 hover:text-emerald-300 font-medium">
                  ← Back to sign in
                </button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-8 leading-relaxed">
          By continuing, you agree to our terms of service.
          <br />
          Your data is used only to process your quotes.
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          &larr; Back to home
        </button>
      </div>
    </div>
  );
};
