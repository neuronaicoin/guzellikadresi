import { createClient } from '@supabase/supabase-js';

// Public (anon) client — herkese açık okuma için.
// Bu anahtar tarayıcıda görünür, GÜVENLİDİR (RLS koruyor).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
