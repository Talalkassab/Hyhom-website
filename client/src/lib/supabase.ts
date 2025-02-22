import { createClient } from '@supabase/supabase-js';

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

let initializationInProgress = false;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function createAdminUser(email: string, password: string) {
  if (initializationInProgress) {
    console.log('Admin user initialization already in progress');
    return null;
  }

  try {
    initializationInProgress = true;

    // First, check if we can sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!signInError && signInData?.user) {
      console.log('Admin user signed in successfully');
      return signInData;
    }

    // Wait before trying to create a new user to avoid rate limits
    await delay(RETRY_DELAY);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'admin' },
      }
    });

    if (error) {
      if (error.message?.includes('User already registered')) {
        // User exists but couldn't sign in - might need confirmation
        console.log('User exists but needs confirmation');
        return null;
      }
      throw error;
    }

    console.log('Admin user created successfully');
    return data;

  } catch (error: any) {
    console.error('Error in createAdminUser:', error);

    if (error.message?.includes('over_email_send_rate_limit') && retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retrying after delay... Attempt ${retryCount} of ${MAX_RETRIES}`);
      await delay(RETRY_DELAY * retryCount);
      return createAdminUser(email, password);
    }

    return null;
  } finally {
    initializationInProgress = false;
  }
}

// Function to initialize admin user
export async function initializeAdminUser() {
  try {
    retryCount = 0; // Reset retry count
    const result = await createAdminUser('talal.kassab@alshamal.co', 'HyhomAdmin2024!');
    if (result?.user) {
      console.log('Admin user setup complete');
    } else {
      console.log('Admin user initialization failed - may need email confirmation');
    }
  } catch (error) {
    console.error('Failed to initialize admin user:', error);
  }
}

// Only initialize if we're not already logged in
supabase.auth.getSession().then(({ data: { session } }) => {
  if (!session?.user) {
    initializeAdminUser();
  }
});