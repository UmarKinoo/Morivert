/**
 * Role-based access control (RBAC) for Morivert SaaS.
 * Single source of truth for admin checks; DB enforces via RLS and is_admin().
 */
import { supabase } from '../supabase';

export type AppRole = 'user' | 'admin';

const ADMIN_ROLE: AppRole = 'admin';

/**
 * Returns whether the current authenticated user is an admin.
 * Uses DB function public.is_admin() (backed by app_admins table or fallback email).
 * Unauthenticated or non-admin users get false.
 */
export async function getIsAdmin(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    console.warn('[RBAC] is_admin RPC error:', error.message);
    return false;
  }
  return data === true;
}

/**
 * Resolve effective role for the current user (for UI/guards).
 * Admins can access both admin and user areas; users only user areas.
 */
export async function getEffectiveRole(): Promise<AppRole | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const isAdmin = await getIsAdmin();
  return isAdmin ? ADMIN_ROLE : 'user';
}
