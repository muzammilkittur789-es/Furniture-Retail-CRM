import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./server";

const DEFAULT_URL = "https://placeholder-project.supabase.co";
const DEFAULT_KEY = "placeholder-anon-key";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});
