import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Production Supabase Configuration for CampiFa Free Storage
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://pwsmfofmqgkmfretkfmu.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c21mb2ZtcWdrbWZyZXRrZm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMTE4MTIsImV4cCI6MjEwMjc4NzgxMn0.lSNO8jvHDqr9PkBPfEIyVa_mYJSSL-6LthZJdmohf_Y';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    supabaseUrl.trim() !== '' &&
    supabaseUrl.startsWith('https://') &&
    !!supabaseAnonKey &&
    supabaseAnonKey.trim() !== ''
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
