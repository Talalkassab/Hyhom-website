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

    // Update user with confirmed email
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (error) {
      throw error;
    }

    // Double-check the user's status
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    if (verifyError) {
      throw verifyError;
    }

    console.log('User status after confirmation:', verifyData);

    return { success: true, data: verifyData };
  } catch (error: any) {
    console.error('Error confirming email:', error);
    return { success: false, error: error.message };
  }
}