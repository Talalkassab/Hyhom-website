#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the schema file
const schemaPath = path.join(__dirname, '../supabase/schema_safe.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('🚀 Database Schema Setup');
console.log('========================');
console.log();
console.log('To set up your database, please:');
console.log();
console.log('1. Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard/project/abaevmfyuvbmeepcprxh/sql/new');
console.log();
console.log('2. Copy and paste the following SQL schema:');
console.log();
console.log('--- START OF SCHEMA ---');
console.log(schema);
console.log('--- END OF SCHEMA ---');
console.log();
console.log('3. Click "Run" to execute the schema');
console.log();
console.log('4. After successful execution, your database will be ready!');
console.log();
console.log('📋 What this schema creates:');
console.log('• 10 tables with proper relationships');
console.log('• Row Level Security (RLS) policies');
console.log('• Database functions and triggers');
console.log('• Indexes for performance');
console.log('• Bilingual support (Arabic/English)');
console.log();
console.log('✅ Your .env.local file is already configured with the correct keys!');