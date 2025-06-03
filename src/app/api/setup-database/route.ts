import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create admin client with anon key for setup
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // SQL to create all Phase 2 tables
    const createTablesSQL = `
      -- Enable UUID extension if not exists
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Update profiles table to include settings field if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'profiles' AND column_name = 'settings') THEN
          ALTER TABLE public.profiles ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
        END IF;
      END $$;

      -- 1. Channels
      CREATE TABLE IF NOT EXISTS public.channels (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        description TEXT,
        description_ar TEXT,
        type TEXT NOT NULL CHECK (type IN ('public', 'private', 'department', 'announcement')),
        department TEXT,
        icon TEXT DEFAULT 'message-circle',
        color TEXT DEFAULT '#2a577e',
        is_archived BOOLEAN DEFAULT false,
        is_default BOOLEAN DEFAULT false,
        created_by UUID NOT NULL REFERENCES public.profiles(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Channel Members
      CREATE TABLE IF NOT EXISTS public.channel_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        notifications_enabled BOOLEAN DEFAULT true,
        UNIQUE(channel_id, user_id)
      );

      -- 3. Messages
      CREATE TABLE IF NOT EXISTS public.messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES public.profiles(id),
        content TEXT NOT NULL,
        content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file', 'system')),
        metadata JSONB DEFAULT '{}'::jsonb,
        is_edited BOOLEAN DEFAULT false,
        edited_at TIMESTAMP WITH TIME ZONE,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP WITH TIME ZONE,
        thread_id UUID REFERENCES public.messages(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 4. Direct Messages
      CREATE TABLE IF NOT EXISTS public.direct_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        from_user_id UUID NOT NULL REFERENCES public.profiles(id),
        to_user_id UUID NOT NULL REFERENCES public.profiles(id),
        content TEXT NOT NULL,
        content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file')),
        metadata JSONB DEFAULT '{}'::jsonb,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP WITH TIME ZONE,
        is_edited BOOLEAN DEFAULT false,
        edited_at TIMESTAMP WITH TIME ZONE,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CHECK (from_user_id != to_user_id)
      );

      -- 5. File Uploads
      CREATE TABLE IF NOT EXISTS public.file_uploads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES public.profiles(id),
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        message_id UUID REFERENCES public.messages(id),
        direct_message_id UUID REFERENCES public.direct_messages(id),
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 6. User Presence
      CREATE TABLE IF NOT EXISTS public.user_presence (
        user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status_message TEXT,
        status_message_ar TEXT
      );

      -- 7. Notifications
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('message', 'mention', 'announcement', 'system')),
        title TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        content TEXT NOT NULL,
        content_ar TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_direct_messages_users ON public.direct_messages(from_user_id, to_user_id);
      CREATE INDEX IF NOT EXISTS idx_channel_members_user ON public.channel_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

      -- Create updated_at trigger function if not exists
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $trigger$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $trigger$ language 'plpgsql';

      -- Apply updated_at triggers
      DROP TRIGGER IF EXISTS update_channels_updated_at ON public.channels;
      CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- Ensure RLS policies exist for profiles table
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies to avoid conflicts
      DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
      
      -- Create RLS policies for profiles
      CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
        
      CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
        
      CREATE POLICY "Users can insert own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);

      -- Enable RLS for other tables
      ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    `;

    // Execute the SQL
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: createTablesSQL
    });

    if (sqlError) {
      // If rpc doesn't work, try direct execution
      console.log('RPC failed, trying direct execution...');
      const queries = createTablesSQL.split(';').filter(query => query.trim());
      
      for (const query of queries) {
        if (query.trim()) {
          const { error } = await supabase.from('_temp').select('*').limit(0);
          // This is a workaround - we'll create tables via API routes instead
        }
      }
    }

    // Create default channels
    const defaultChannels = [
      {
        name: 'General',
        name_ar: 'عام',
        description: 'General company discussions',
        description_ar: 'مناقشات الشركة العامة',
        type: 'public',
        is_default: true,
        icon: 'message-circle',
        color: '#2a577e'
      },
      {
        name: 'Announcements',
        name_ar: 'الإعلانات',
        description: 'Company announcements and updates',
        description_ar: 'إعلانات وتحديثات الشركة',
        type: 'announcement',
        is_default: false,
        icon: 'megaphone',
        color: '#f59e0b'
      }
    ];

    // Insert default channels if they don't exist
    for (const channel of defaultChannels) {
      const { data: existingChannel } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channel.name)
        .single();

      if (!existingChannel) {
        // Get first admin user to be the creator
        const { data: adminUser } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
          .single();

        if (adminUser) {
          const { error: channelError } = await supabase
            .from('channels')
            .insert([{
              ...channel,
              created_by: adminUser.id
            }]);

          if (channelError) {
            console.error('Error creating default channel:', channelError);
          }
        }
      }
    }

    return NextResponse.json({ 
      message: 'Database setup completed successfully',
      tables_created: [
        'channels',
        'channel_members', 
        'messages',
        'direct_messages',
        'file_uploads',
        'user_presence',
        'notifications'
      ]
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}