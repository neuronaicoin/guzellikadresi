'use client';

import { createClient } from '@supabase/supabase-js';

// Auth client — session'ı tarayıcıda saklar (giriş durumu kalıcı).
// Sadece client component'lerde kullanılır.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'ga-auth',
  },
});
