import { createClient } from '@supabase/supabase-js';
import { secureStoreAdapter } from './actions/secureStore.actions';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Klien Supabase MAMORI dengan adapter autentikasi aman expo-secure-store.
 * Memenuhi kriteria Sub-CPMK 8 & PRD F-91 (hardware-backed secure encryption).
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
