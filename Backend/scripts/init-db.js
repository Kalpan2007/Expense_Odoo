#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script helps initialize your Supabase database with the required schema.
 * Run this after setting up your Supabase project and updating the .env file.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env file and ensure the following are set:');
  console.log('- SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // Read the SQL schema file
    const sqlPath = path.join(process.cwd(), 'src', 'config', 'database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Executing database schema...');

    // Execute the schema
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }

    console.log('✅ Database schema created successfully!');

    // Test the connection by checking if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['companies', 'users', 'expenses', 'approval_workflows', 'approval_rules']);

    if (tablesError) {
      console.warn('⚠️ Could not verify tables, but schema might have been created');
    } else {
      console.log(`✅ Found ${tables.length} tables in the database`);
    }

    console.log('');
    console.log('🎉 Database initialization complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your .env file with the correct Supabase credentials');
    console.log('2. Start the backend server: npm run dev');
    console.log('3. Start the frontend: cd ../Frontend && npm run dev');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}
// 

// Run the initialization
initializeDatabase();