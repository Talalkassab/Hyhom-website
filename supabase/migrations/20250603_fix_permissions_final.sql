-- Final Permissions Fix Migration
-- This migration ensures all RLS policies work correctly by granting proper permissions

-- 1. Grant essential permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;  
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant read-only access to anon role for public data
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 2. Ensure profiles have proper data for existing users
UPDATE public.profiles 
SET 
    full_name = CASE 
        WHEN full_name = '' OR full_name IS NULL THEN 'User'
        ELSE full_name 
    END,
    full_name_ar = CASE 
        WHEN full_name_ar = '' OR full_name_ar IS NULL THEN 'مستخدم'
        ELSE full_name_ar 
    END
WHERE full_name = '' OR full_name IS NULL OR full_name_ar = '' OR full_name_ar IS NULL;

-- 3. Verify all auth users have profiles
INSERT INTO public.profiles (id, email, full_name, full_name_ar)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(u.raw_user_meta_data->>'full_name_ar', 'مستخدم')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. Verify all auth users have user_presence records
INSERT INTO public.user_presence (user_id, status)
SELECT 
    u.id,
    'offline'
FROM auth.users u
LEFT JOIN public.user_presence up ON u.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 5. Verify all auth users have user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
    u.id,
    'employee'
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;