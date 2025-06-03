import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('API route: Attempting login for:', email);
    
    // Create Supabase client directly
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    console.log('API route: Supabase client created');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('API route: Auth response:', { data: data?.user?.email, error });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    const response = NextResponse.json({ 
      user: data.user,
      session: data.session 
    });
    
    return response;
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}