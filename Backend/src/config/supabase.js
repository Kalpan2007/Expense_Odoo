import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Supabase Configuration Check:');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Anon Key:', supabaseKey ? '✅ Set' : '❌ Missing');
console.log('Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required Supabase environment variables');
  console.log('\n📋 Required variables:');
  console.log('- SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('- SUPABASE_ANON_KEY=your_anon_key');
  console.log('- SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('\n🔗 Get these from: https://supabase.com/dashboard > Your Project > Settings > API');
  throw new Error('Missing Supabase environment variables');
}

// Use service role key if available, otherwise use anon key
const keyToUse = supabaseServiceKey || supabaseKey;

export const supabase = createClient(supabaseUrl, keyToUse);
