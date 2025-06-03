-- HYHOM Connect Default Data
-- Run this after creating your first admin user

-- Insert default general channel
-- Replace 'YOUR_FIRST_USER_ID_HERE' with the actual UUID of your first admin user
INSERT INTO public.channels (name, name_ar, description, description_ar, type, is_default, created_by)
VALUES (
  'General',
  'عام',
  'General discussion channel for all employees',
  'قناة المناقشة العامة لجميع الموظفين',
  'public',
  true,
  'YOUR_FIRST_USER_ID_HERE'::UUID
);

-- Insert default announcement channel
INSERT INTO public.channels (name, name_ar, description, description_ar, type, icon, color, created_by)
VALUES (
  'Announcements',
  'الإعلانات',
  'Company-wide announcements',
  'إعلانات على مستوى الشركة',
  'announcement',
  'megaphone',
  '#ef4444',
  'YOUR_FIRST_USER_ID_HERE'::UUID
);

-- Optional: Update the first user to admin role
-- UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'YOUR_FIRST_USER_ID_HERE'::UUID;