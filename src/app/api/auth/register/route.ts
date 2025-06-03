import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, fullNameAr } = await request.json();
    
    console.log('API route: Attempting registration for:', email);
    
    // Create Supabase client directly
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // First, create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          full_name_ar: fullNameAr,
        },
      },
    });
    
    console.log('Registration response:', { user: authData?.user?.email, error: authError });
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    
    // Profile will be created automatically by database trigger
    // No need to manually create it here
    
    return NextResponse.json({ 
      user: authData.user,
      session: authData.session,
      message: 'Registration successful! You can now login.' 
    });
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}