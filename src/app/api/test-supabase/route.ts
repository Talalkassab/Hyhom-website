import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        url: !!url,
        key: !!key 
      }, { status: 500 });
    }
    
    const supabase = createClient(url, key);
    
    // Test basic connectivity
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    return NextResponse.json({
      status: 'connected',
      supabaseUrl: url,
      hasKey: !!key,
      testQuery: { success: !error, error: error?.message }
    });
    
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}