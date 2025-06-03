const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createDefaultChannels() {
  try {
    console.log('Fetching admin user...');
    
    // Get the first admin user
    const { data: adminUser, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
      .single();
    
    if (adminError || !adminUser) {
      console.log('No admin user found. Getting any user...');
      // If no admin, get any user
      const { data: anyUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();
      
      if (userError || !anyUser) {
        console.error('No users found in the system. Please create a user first.');
        return;
      }
      
      adminUser.user_id = anyUser.id;
    }
    
    const userId = adminUser.user_id;
    console.log('Using user ID:', userId);
    
    // Check if default channels already exist
    const { data: existingChannels } = await supabase
      .from('channels')
      .select('name')
      .in('name', ['General', 'Announcements']);
    
    if (existingChannels && existingChannels.length > 0) {
      console.log('Default channels already exist:', existingChannels.map(c => c.name).join(', '));
      return;
    }
    
    // Create General channel
    console.log('Creating General channel...');
    const { data: generalChannel, error: generalError } = await supabase
      .from('channels')
      .insert({
        name: 'General',
        name_ar: 'عام',
        description: 'General discussion channel for all employees',
        description_ar: 'قناة المناقشة العامة لجميع الموظفين',
        type: 'public',
        is_default: true,
        created_by: userId
      })
      .select()
      .single();
    
    if (generalError) {
      console.error('Error creating General channel:', generalError);
    } else {
      console.log('General channel created successfully');
      
      // Add creator as owner
      await supabase
        .from('channel_members')
        .insert({
          channel_id: generalChannel.id,
          user_id: userId,
          role: 'owner'
        });
    }
    
    // Create Announcements channel
    console.log('Creating Announcements channel...');
    const { data: announcementChannel, error: announcementError } = await supabase
      .from('channels')
      .insert({
        name: 'Announcements',
        name_ar: 'الإعلانات',
        description: 'Company-wide announcements',
        description_ar: 'إعلانات على مستوى الشركة',
        type: 'announcement',
        icon: 'megaphone',
        color: '#ef4444',
        created_by: userId
      })
      .select()
      .single();
    
    if (announcementError) {
      console.error('Error creating Announcements channel:', announcementError);
    } else {
      console.log('Announcements channel created successfully');
      
      // Add creator as owner
      await supabase
        .from('channel_members')
        .insert({
          channel_id: announcementChannel.id,
          user_id: userId,
          role: 'owner'
        });
    }
    
    console.log('Default channels setup complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createDefaultChannels();