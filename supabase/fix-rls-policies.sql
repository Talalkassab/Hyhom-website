-- Fix RLS Policies for HYHOM Connect
-- This script fixes the permission denied errors

-- First, let's check if RLS is enabled and temporarily disable it for fixes
-- Note: Run this in Supabase SQL Editor

-- 1. Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;

-- 2. Create new, more permissive policies for profiles
-- Allow users to view all active profiles
CREATE POLICY "Enable read access for all users" ON public.profiles
    FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Enable update for users based on id" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 3. Fix user_presence policies
DROP POLICY IF EXISTS "presence_select_all" ON public.user_presence;
DROP POLICY IF EXISTS "presence_insert_own" ON public.user_presence;
DROP POLICY IF EXISTS "presence_update_own" ON public.user_presence;

-- Allow all authenticated users to view presence
CREATE POLICY "Enable read access for all users" ON public.user_presence
    FOR SELECT USING (true);

-- Allow users to insert/update their own presence
CREATE POLICY "Enable insert for users based on user_id" ON public.user_presence
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.user_presence
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Fix notifications policies
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_system" ON public.notifications;

-- Users can only see their own notifications
CREATE POLICY "Enable read access for users to own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Enable update for users to own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow insert for all (system will create notifications)
CREATE POLICY "Enable insert for all users" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- 5. Fix the handle_new_user function to ensure it runs with proper permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the profile
  INSERT INTO public.profiles (id, email, full_name, full_name_ar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'full_name_ar', 'مستخدم')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign default employee role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Initialize user presence
  INSERT INTO public.user_presence (user_id, status)
  VALUES (NEW.id, 'offline')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Add to general channel if exists
  INSERT INTO public.channel_members (channel_id, user_id, role)
  SELECT id, NEW.id, 'member' 
  FROM public.channels 
  WHERE is_default = true
  ON CONFLICT (channel_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create a function to manually fix existing users who don't have profiles
CREATE OR REPLACE FUNCTION public.fix_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all auth users
  FOR user_record IN SELECT * FROM auth.users LOOP
    -- Insert profile if missing
    INSERT INTO public.profiles (id, email, full_name, full_name_ar)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', split_part(user_record.email, '@', 1)),
      COALESCE(user_record.raw_user_meta_data->>'full_name_ar', split_part(user_record.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert role if missing
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_record.id, 'employee')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert presence if missing
    INSERT INTO public.user_presence (user_id, status)
    VALUES (user_record.id, 'offline')
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Run the fix function
SELECT public.fix_missing_profiles();

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;