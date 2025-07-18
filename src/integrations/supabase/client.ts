// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xvuxqpcofongobkvegql.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dXhxcGNvZm9uZ29ia3ZlZ3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NDUyNTEsImV4cCI6MjA2NzQyMTI1MX0.Q92Ts8U-bKmmZAliLwQKH6TJoPeyGG9z9Hh3sFMoR_0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});