import { createClient } from '@supabase/supabase-js';

// In the browser, we only use the VITE_ prefixed environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  }
});

export async function ensureAdminUser(email: string, password: string) {
  try {
    // First try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!signInError && signInData?.user) {
      return signInData;
    }

    // If sign in fails, try to create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'admin' },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      if (error.message?.includes('User already registered')) {
        // User exists but needs confirmation
        return { error: 'User exists but needs confirmation' };
      }
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error in ensureAdminUser:', error);
    return { error: error.message };
  }
}