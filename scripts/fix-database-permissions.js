const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// You need to use the service role key for this script
// Add it to your .env.local as SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runFixScript() {
  try {
    console.log('🔧 Starting database permission fixes...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'fix-rls-policies.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 SQL script loaded. This will:');
    console.log('  - Fix Row Level Security policies');
    console.log('  - Create missing user profiles');
    console.log('  - Set up proper permissions\n');

    console.log('⚠️  IMPORTANT: This script requires admin access to your Supabase project.');
    console.log('⚠️  Please run the SQL script manually in the Supabase Dashboard:\n');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the contents of: supabase/fix-rls-policies.sql');
    console.log('4. Click "Run"\n');

    // Try to check if we can access the database
    console.log('🔍 Checking database connection...');
    const { data: tables, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Cannot access database with current credentials.');
      console.log('   Error:', error.message);
      console.log('\n💡 This is expected if you\'re using the anon key.');
    } else {
      console.log('✅ Database connection successful!');
      console.log(`   Found ${tables} profile records.`);
    }

    console.log('\n📋 Next steps:');
    console.log('1. Run the SQL script in Supabase Dashboard');
    console.log('2. Create default channels: npm run setup:channels');
    console.log('3. Test the application');

    // Save a quick test script
    const testScript = `
// Quick test script to verify permissions are fixed
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPermissions() {
  console.log('Testing database permissions...');
  
  // Test 1: Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.log('❌ Not logged in. Please login first.');
    return;
  }
  console.log('✅ Logged in as:', user.email);
  
  // Test 2: Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError) {
    console.log('❌ Cannot fetch profile:', profileError.message);
  } else {
    console.log('✅ Profile found:', profile.email);
  }
  
  // Test 3: Get channels
  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select('*');
    
  if (channelsError) {
    console.log('❌ Cannot fetch channels:', channelsError.message);
  } else {
    console.log('✅ Found', channels.length, 'channels');
  }
}

testPermissions();
`;

    fs.writeFileSync(path.join(__dirname, 'test-permissions.js'), testScript);
    console.log('\n✅ Created test script: scripts/test-permissions.js');
    console.log('   Run it after fixing permissions: node scripts/test-permissions.js');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

runFixScript();