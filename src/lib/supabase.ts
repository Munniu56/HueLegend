/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Doc cau hinh tu bien moi truong Vite
const meta = import.meta as any;
const supabaseUrl = (meta && meta.env && meta.env.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (meta && meta.env && meta.env.VITE_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'HueLegend: Supabase chua duoc cau hinh VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY. Ung dung se hoat dong o che do Du lieu On-Chain / Fallback local.'
  );
}

// Khoi tao Supabase Client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
