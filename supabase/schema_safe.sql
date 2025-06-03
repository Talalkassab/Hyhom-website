-- HYHOM Connect Database Schema (Safe Version)
-- Version 1.0
-- This version removes the default data inserts that depend on existing users

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  full_name_ar TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  department TEXT CHECK (department IN ('management', 'operations', 'kitchen', 'service', 'hr', 'finance', 'marketing')),
  position TEXT,
  position_ar TEXT,
  bio TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sound": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'employee')),
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Channels
CREATE TABLE public.channels (
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

-- 4. Channel Members
CREATE TABLE public.channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notifications_enabled BOOLEAN DEFAULT true,
  UNIQUE(channel_id, user_id)
);

-- 5. Messages
CREATE TABLE public.messages (
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

-- 6. Direct Messages
CREATE TABLE public.direct_messages (
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

-- 7. File Uploads
CREATE TABLE public.file_uploads (
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

-- 8. User Presence
CREATE TABLE public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_message TEXT,
  status_message_ar TEXT
);

-- 9. Notifications
CREATE TABLE public.notifications (
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

-- 10. Activity Logs (for admins)
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_direct_messages_users ON public.direct_messages(from_user_id, to_user_id);
CREATE INDEX idx_channel_members_user ON public.channel_members(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = $1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- RLS Policies

-- 1. Profiles Policies
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (is_active = true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "profiles_insert_admin" ON public.profiles
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- 2. User Roles Policies
CREATE POLICY "roles_select_own" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "roles_select_admin" ON public.user_roles
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "roles_insert_admin" ON public.user_roles
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "roles_update_admin" ON public.user_roles
  FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- 3. Channels Policies
CREATE POLICY "channels_select_public" ON public.channels
  FOR SELECT USING (
    type = 'public' 
    OR type = 'announcement'
    OR id IN (
      SELECT channel_id FROM public.channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "channels_insert" ON public.channels
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'supervisor')
  );

CREATE POLICY "channels_update" ON public.channels
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR get_user_role(auth.uid()) = 'admin'
  );

-- 4. Channel Members Policies
CREATE POLICY "channel_members_select" ON public.channel_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR channel_id IN (
      SELECT channel_id FROM public.channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "channel_members_insert" ON public.channel_members
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_id = channel_members.channel_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- 5. Messages Policies
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM public.channel_members 
      WHERE user_id = auth.uid()
    )
    OR channel_id IN (
      SELECT id FROM public.channels 
      WHERE type IN ('public', 'announcement')
    )
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
      channel_id IN (
        SELECT channel_id FROM public.channel_members 
        WHERE user_id = auth.uid()
      )
      OR channel_id IN (
        SELECT id FROM public.channels 
        WHERE type = 'public'
      )
    )
  );

CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE USING (user_id = auth.uid());

-- 6. Direct Messages Policies
CREATE POLICY "dm_select" ON public.direct_messages
  FOR SELECT USING (
    from_user_id = auth.uid() 
    OR to_user_id = auth.uid()
  );

CREATE POLICY "dm_insert" ON public.direct_messages
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "dm_update" ON public.direct_messages
  FOR UPDATE USING (from_user_id = auth.uid());

-- 7. Notifications Policies
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_system" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 8. Activity Logs Policies
CREATE POLICY "logs_select_admin" ON public.activity_logs
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "logs_insert_system" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- Database Functions

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, full_name_ar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name_ar', '')
  );
  
  -- Assign default employee role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  -- Add to general channel (only if it exists)
  INSERT INTO public.channel_members (channel_id, user_id)
  SELECT id, NEW.id FROM public.channels WHERE is_default = true LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last seen
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen = NOW()
  WHERE id = auth.uid();
  
  UPDATE public.user_presence
  SET last_seen = NOW(), status = 'online'
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread messages count
CREATE OR REPLACE FUNCTION public.get_unread_count(user_uuid UUID)
RETURNS TABLE (
  channel_id UUID,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.channel_id,
    COUNT(m.id) as unread_count
  FROM public.messages m
  JOIN public.channel_members cm ON cm.channel_id = m.channel_id
  WHERE cm.user_id = user_uuid
    AND m.created_at > cm.last_read_at
    AND m.user_id != user_uuid
  GROUP BY m.channel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTE: Default data should be inserted after the first user is created
-- You can run this after setting up your first admin user:
-- 
-- INSERT INTO public.channels (name, name_ar, description, description_ar, type, is_default, created_by)
-- VALUES (
--   'General',
--   'عام',
--   'General discussion channel for all employees',
--   'قناة المناقشة العامة لجميع الموظفين',
--   'public',
--   true,
--   '<your_first_user_id>'
-- );
-- 
-- INSERT INTO public.channels (name, name_ar, description, description_ar, type, icon, color, created_by)
-- VALUES (
--   'Announcements',
--   'الإعلانات',
--   'Company-wide announcements',
--   'إعلانات على مستوى الشركة',
--   'announcement',
--   'megaphone',
--   '#ef4444',
--   '<your_first_user_id>'
-- );