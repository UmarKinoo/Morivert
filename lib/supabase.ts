import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey?.length);

if (!hasCredentials) {
  console.warn(
    'Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. App will load; quote submit and admin will not work until configured.'
  );
}

/** Auth options: session persisted in localStorage, auto-refresh token, detect session in URL (magic link / reset). */
const authOptions = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
};

function createSupabaseClient(): SupabaseClient {
  try {
    const url = hasCredentials ? supabaseUrl! : 'https://placeholder.supabase.co';
    const key = hasCredentials ? supabaseAnonKey! : 'placeholder-anon-key';
    return createClient(url, key, { auth: authOptions });
  } catch (e) {
    console.error('Supabase client init failed:', e);
    return createClient('https://placeholder.supabase.co', 'placeholder-anon-key', { auth: authOptions });
  }
}

export const supabase = createSupabaseClient();
