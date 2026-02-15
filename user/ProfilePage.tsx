import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import type { User } from '@supabase/supabase-js';

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <section className="mb-10">
    <h2 className="text-sm font-semibold text-white mb-1">{title}</h2>
    {description && <p className="text-xs text-zinc-500 mb-4">{description}</p>}
    {children}
  </section>
);

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [signOutLoading, setSignOutLoading] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'deleting'>('idle');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailMessage('');
    if (!newEmail.trim()) {
      setEmailError('Enter a new email address.');
      return;
    }
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      setEmailError(error.message);
      setEmailLoading(false);
      return;
    }
    setEmailMessage('Check your new email to verify. You may need to sign in again.');
    toast('Verification email sent to your new address.', 'success');
    setNewEmail('');
    setEmailLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
      setPasswordLoading(false);
      return;
    }
    setPasswordMessage('Password updated.');
    toast('Password updated successfully.', 'success');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordLoading(false);
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await supabase.auth.signOut();
    navigate('/');
    setSignOutLoading(false);
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteStep('deleting');
    const { error } = await supabase.rpc('delete_my_account');
    if (error) {
      setDeleteError(error.message);
      setDeleteStep('confirm');
      return;
    }
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/login?returnTo=/profile');
    return null;
  }

  const displayName = user.user_metadata?.full_name || user.email || 'Account';
  const avatarUrl = user.user_metadata?.avatar_url;
  const email = user.email || '';
  const provider = user.app_metadata?.provider ? (user.app_metadata.provider as string) : 'email';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-lg font-medium tracking-tight text-white hover:text-zinc-300 transition-colors"
          >
            MORIVERT
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              My Quotes
            </button>
            <button
              onClick={() => navigate('/quote')}
              className="text-xs bg-emerald-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-emerald-400 transition-colors"
            >
              New Quote
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-light tracking-tight text-white">Account settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your profile and security.</p>
        </div>

        {/* Profile */}
        <Section title="Profile" description="Your public account information.">
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 space-y-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-16 h-16 rounded-full border-2 border-zinc-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-2xl font-medium text-zinc-400">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-white">{displayName}</p>
                <p className="text-sm text-zinc-500">{email}</p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600 mt-1">
                  Signed up via {provider === 'google' ? 'Google' : 'Email'}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-600">
              Name and avatar are managed by your sign-in provider. To change them, update your Google account.
            </p>
          </div>
        </Section>

        {/* Security — Change email */}
        <Section
          title="Email address"
          description="Change the email address associated with your account. You’ll need to verify the new address."
        >
          <form onSubmit={handleChangeEmail} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 space-y-4">
            <div>
              <label htmlFor="profile-email" className="block text-xs font-medium text-zinc-400 mb-2">
                New email
              </label>
              <input
                id="profile-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {emailError && <p className="text-sm text-red-400">{emailError}</p>}
            {emailMessage && <p className="text-sm text-emerald-400">{emailMessage}</p>}
            <button
              type="submit"
              disabled={emailLoading || !newEmail.trim()}
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading ? 'Updating…' : 'Update email'}
            </button>
          </form>
        </Section>

        {/* Security — Change password */}
        <Section
          title="Password"
          description="Set a new password. Leave blank if you only sign in with Google."
        >
          <form onSubmit={handleChangePassword} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 space-y-4">
            <div>
              <label htmlFor="profile-password" className="block text-xs font-medium text-zinc-400 mb-2">
                New password
              </label>
              <input
                id="profile-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="profile-password-confirm" className="block text-xs font-medium text-zinc-400 mb-2">
                Confirm new password
              </label>
              <input
                id="profile-password-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-emerald-400">{passwordMessage}</p>}
            <button
              type="submit"
              disabled={passwordLoading || !newPassword || newPassword !== confirmPassword}
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </Section>

        {/* Connected accounts */}
        <Section title="Connected accounts" description="Services linked to your account.">
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09a5.06 5.06 0 01-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Google</p>
                  <p className="text-xs text-zinc-500">
                    {provider === 'google' ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              {provider === 'google' && (
                <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-medium">Active</span>
              )}
            </div>
          </div>
        </Section>

        {/* Sign out */}
        <Section title="Sign out" description="Sign out of your account on this device.">
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <button
              onClick={handleSignOut}
              disabled={signOutLoading}
              className="text-sm font-medium text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
            >
              {signOutLoading ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Danger zone" description="Permanently delete your account and all associated data. This cannot be undone.">
          <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20 space-y-4">
            {deleteStep === 'idle' && (
              <button
                onClick={() => setDeleteStep('confirm')}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Delete my account
              </button>
            )}
            {deleteStep === 'confirm' && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">
                  Are you sure? This will permanently delete your account, all your quotes, and all associated data. This action cannot be reversed.
                </p>
                {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors"
                  >
                    Yes, delete my account
                  </button>
                  <button
                    onClick={() => { setDeleteStep('idle'); setDeleteError(''); }}
                    className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {deleteStep === 'deleting' && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-zinc-400">Deleting account…</span>
              </div>
            )}
          </div>
        </Section>

        <div className="pt-4 pb-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            ← Back to My Quotes
          </button>
        </div>
      </main>
    </div>
  );
};
