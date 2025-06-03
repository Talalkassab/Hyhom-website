# HYHOM Connect Database Schema Deployment Guide

This guide will help you deploy the database schema to your Supabase project `abaevmfyuvbmeepcprxh`.

## Prerequisites

1. **Supabase CLI installed** ✅ (Already available at `/opt/homebrew/bin/supabase`)
2. **Supabase account access** - You need to authenticate with Supabase
3. **Project access** - Access to project `abaevmfyuvbmeepcprxh`

## Option 1: Using Supabase CLI (Recommended)

### Step 1: Authenticate with Supabase
```bash
cd /Users/hanouf/Hyhom-website/hyhom-connect
supabase login
```

### Step 2: Link to your remote project
```bash
supabase link --project-ref abaevmfyuvbmeepcprxh
```

### Step 3: Deploy the schema using migration
```bash
# Option A: Deploy existing migration
supabase db push

# Option B: Deploy the safe schema directly
supabase db reset --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.abaevmfyuvbmeepcprxh.supabase.co:5432/postgres"
```

### Step 4: Verify deployment
```bash
supabase db diff --local --remote
```

## Option 2: Using Supabase Dashboard (Web Interface)

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Navigate to your project: `abaevmfyuvbmeepcprxh`

### Step 2: Execute Schema via SQL Editor
1. In your project dashboard, click on "SQL Editor" in the sidebar
2. Click "New Query"
3. Copy the contents of `/Users/hanouf/Hyhom-website/hyhom-connect/supabase/schema_safe.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the schema

### Step 3: Add Default Data (After First User)
1. After creating your first admin user through authentication
2. Note the user's UUID from the `auth.users` table
3. Open `/Users/hanouf/Hyhom-website/hyhom-connect/supabase/default_data.sql`
4. Replace `YOUR_FIRST_USER_ID_HERE` with the actual UUID
5. Run this SQL in the SQL Editor

## Option 3: Using Direct Database Connection

### Step 1: Get Connection Details
From your Supabase project dashboard:
1. Go to Settings → Database
2. Copy the connection string (use the one with `[YOUR-PASSWORD]` placeholder)
3. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 2: Connect using psql
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.abaevmfyuvbmeepcprxh.supabase.co:5432/postgres"
```

### Step 3: Execute Schema
```sql
\i /Users/hanouf/Hyhom-website/hyhom-connect/supabase/schema_safe.sql
```

## Schema Components

The schema includes:

### Tables Created:
1. **profiles** - User profile information extending auth.users
2. **user_roles** - User role management (admin, supervisor, employee)
3. **channels** - Communication channels (public, private, department, announcement)
4. **channel_members** - Channel membership and permissions
5. **messages** - Channel messages with threading support
6. **direct_messages** - Private direct messages between users
7. **file_uploads** - File attachment metadata
8. **user_presence** - Online status and presence information
9. **notifications** - System notifications
10. **activity_logs** - Audit trail for admin actions

### Security Features:
- **Row Level Security (RLS)** enabled on all tables
- **Comprehensive policies** for data access control
- **Role-based permissions** (admin, supervisor, employee)
- **Secure functions** with SECURITY DEFINER

### Performance Optimizations:
- **Strategic indexes** on frequently queried columns
- **Optimized queries** for message retrieval and user lookup
- **Efficient unread count** calculation

### Triggers and Functions:
- **Auto-update timestamps** on profile and channel updates
- **New user registration handler** with automatic role assignment
- **Last seen updater** for presence tracking
- **Unread message counter** for efficient notification badges

## Post-Deployment Steps

### 1. Verify Tables Created
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Test Authentication Flow
1. Create a test user through your application
2. Verify the user appears in both `auth.users` and `public.profiles`
3. Check that default role is assigned in `public.user_roles`

### 4. Add Default Channels
After creating your first admin user, run the default data script with the user's actual UUID.

## Troubleshooting

### Common Issues:

1. **"relation does not exist" errors**: Ensure you're running the schema on the correct database
2. **Permission denied**: Make sure you're using a user with sufficient privileges (postgres user or service role)
3. **UUID extension not found**: The script includes `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` which should handle this
4. **RLS policy conflicts**: If rerunning, you may need to drop existing policies first

### Error Handling:
If you encounter errors during deployment:

1. **Check existing objects**: Some may already exist from previous attempts
2. **Use IF NOT EXISTS**: Most CREATE statements include this clause
3. **Manual cleanup**: Drop problematic objects and re-run specific parts
4. **Fresh start**: Reset the database if needed: `supabase db reset`

## Verification Queries

After deployment, run these queries to verify everything is working:

```sql
-- Check all tables exist
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Check triggers are active
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Check functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Test RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Environment Variables

Ensure your `.env.local` file has the correct values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abaevmfyuvbmeepcprxh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

You can find the anon key in your Supabase project dashboard under Settings → API.

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify your authentication and permissions
3. Ensure all environment variables are correctly set
4. Review the error messages for specific guidance

The schema is designed to be robust and handle most edge cases, but if you encounter specific issues, the safe version (`schema_safe.sql`) removes problematic default data that can be added manually after setup.