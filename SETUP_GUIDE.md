# HYHOM Connect Setup Guide

## 🚨 Fixing Permission Errors

If you're seeing "permission denied for schema public" errors, follow these steps:

### Option 1: Using Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Latest Migration**
   - Copy the contents of `supabase/migrations/20250603_fix_permissions_final.sql`
   - Paste it into the SQL editor
   - Click "Run"

4. **Verify Success**
   - You should see "Success. No rows returned"
   - Check for any error messages

**✅ FIXED**: The latest migration (`20250603_fix_permissions_final.sql`) fixes both RLS policies AND grants proper permissions to authenticated users. This resolves the "permission denied for schema public" errors.

### Option 2: Using npm Scripts

1. **Run the setup script**
   ```bash
   npm run setup:db
   ```
   This will show you instructions for fixing the database.

2. **Create default channels**
   ```bash
   npm run setup:channels
   ```

3. **Test permissions**
   ```bash
   npm run test:permissions
   ```

## 📋 Complete Setup Checklist

### 1. Environment Variables
Ensure your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Database Setup
- [ ] Run the RLS policies fix (see above)
- [ ] Verify user profile exists
- [ ] Create default channels

### 3. First User Setup
1. Register a new account at `/en/register`
2. Login at `/en/login`
3. Make the first user an admin:
   ```sql
   UPDATE public.user_roles 
   SET role = 'admin' 
   WHERE user_id = (SELECT id FROM auth.users LIMIT 1);
   ```

### 4. Test the Application
1. **Profile**: Navigate to profile page and update your information
2. **Channels**: Create and join channels
3. **Messages**: Send messages in channels
4. **Direct Messages**: Send DMs to other users

## 🔧 Troubleshooting

### "Permission denied" errors
- Run the RLS policies fix again
- Check if your user has a profile in the `profiles` table
- Verify the auth trigger is working

### Profile not loading
- Check browser console for errors
- Run this SQL to manually create your profile:
  ```sql
  INSERT INTO public.profiles (id, email, full_name, full_name_ar)
  SELECT id, email, 'Your Name', 'اسمك'
  FROM auth.users
  WHERE email = 'your-email@example.com'
  ON CONFLICT (id) DO NOTHING;
  ```

### No channels showing
- Run `npm run setup:channels` to create default channels
- Or create manually in Supabase dashboard

### Can't send messages
- Verify you're a member of the channel
- Check if channel exists in database
- Look for errors in browser console

## 🚀 Quick Start Commands

```bash
# Fix all database issues
npm run setup:all

# Start development server
npm run dev

# Build for production
npm run build
```

## 📞 Need Help?

1. Check browser console for detailed error messages
2. Review Supabase logs in the dashboard
3. Verify all RLS policies are correctly applied
4. Ensure database trigger `on_auth_user_created` exists