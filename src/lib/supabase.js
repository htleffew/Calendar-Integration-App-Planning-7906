import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xqrzjhrmobtwqpwfpiai.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxcnpqaHJtb2J0d3Fwd2ZwaWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDAxNTYsImV4cCI6MjA2OTQ3NjE1Nn0.U7Mn7FFvRTmsm3SVmT_CAR1Pm5Ryc3QuiGqQlmDJfN8'

if(SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})