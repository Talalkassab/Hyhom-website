import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create admin client with service role key for setup
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Check if avatars bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      // Create avatars bucket
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('Error creating avatars bucket:', createError);
        return NextResponse.json({ 
          error: 'Failed to create avatars bucket',
          details: createError.message 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      message: 'Storage setup complete',
      avatarsBucket: avatarsBucketExists ? 'already exists' : 'created'
    });
    
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: 'Storage setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}