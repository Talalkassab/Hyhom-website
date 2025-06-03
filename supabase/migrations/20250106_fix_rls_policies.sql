-- Fix RLS Policies Migration
-- This migration fixes permission denied errors for profiles, presence, and notifications

-- 1. Fix profiles table policies
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;

CREATE POLICY "Enable read access for all users" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Fix user_presence table policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_presence;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.user_presence;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_presence;

-- Create new policies
CREATE POLICY "Enable read access for all users" ON public.user_presence
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for users based on user_id" ON public.user_presence
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.user_presence
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. Fix notifications table policies
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_system" ON public.notifications;

CREATE POLICY "Enable read access for users to own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users to own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for all users" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- 4. Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, full_name_ar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'full_name_ar', 'مستخدم')
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee')
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_presence (user_id, status)
  VALUES (NEW.id, 'offline')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Fix any existing users without profiles
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT * FROM auth.users LOOP
    INSERT INTO public.profiles (id, email, full_name, full_name_ar)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', split_part(user_record.email, '@', 1)),
      COALESCE(user_record.raw_user_meta_data->>'full_name_ar', split_part(user_record.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_record.id, 'employee')
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.user_presence (user_id, status)
    VALUES (user_record.id, 'offline')
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END;
$$;