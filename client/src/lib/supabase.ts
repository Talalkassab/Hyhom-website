import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Initialize Supabase client with additional options for better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false 
  }
});

// Helper function to create admin user with auto-confirmation
export async function createAdminUser(email: string, password: string) {
  try {
    console.log('Attempting to create/verify admin user:', email);

    // First try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!signInError && signInData?.user) {
      console.log('Admin user signed in successfully');
      return signInData;
    }

    console.log('Sign in failed, attempting to create new user');

    // Create new user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'admin' }
      }
    });

    if (error) {
      if (error.message?.includes('User already registered')) {
        console.log('User exists but sign in failed, might need email confirmation');
        return null;
      }
      throw error;
    }

    if (!data.user) {
      throw new Error('No user data returned from signup');
    }

    console.log('Admin user created, attempting immediate sign in');

    // Try to sign in immediately after creation
    const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (newSignInError) {
      console.error('Failed to sign in after creation:', newSignInError);
      return null;
    }

    return newSignIn;
  } catch (error: any) {
    console.error('Error in createAdminUser:', error);
    return null;
  }
}

// Function to initialize admin user
export async function initializeAdminUser() {
  try {
    const response = await createAdminUser('talal.kassab@alshamal.co', 'HyhomAdmin2024!');
    if (response?.user) {
      console.log('Admin user initialized and signed in successfully');
    } else {
      console.log('Admin user might need email confirmation');
    }
  } catch (error: any) {
    console.error('Failed to initialize admin user:', error);
  }
}

// Initialize admin user when the app starts
initializeAdminUser();