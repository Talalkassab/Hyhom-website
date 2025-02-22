import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables for Supabase admin client');
}

// Create admin client using service role key
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);

// Function to confirm email
export async function confirmEmailManually(email: string) {
  try {
    // First, get the user ID
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();

    if (getUserError) throw getUserError;

    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    // Confirm the email
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirmed_at: new Date().toISOString() }
    );

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error confirming email:', error);
    return { success: false, error: error.message };
  }
}
