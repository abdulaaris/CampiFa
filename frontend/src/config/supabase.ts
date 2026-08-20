import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Production Supabase Configuration for CampiFa Free Storage
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://pwsmfofmqgkmfretkfmu.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_slwSnbAQkid4PQUhbWaTAg_YK1EEKhj';

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
