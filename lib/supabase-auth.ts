'use client';

import { createBrowserClient } from '@supabase/ssr';

// Auth client — oturumu ÇEREZDE saklar (localStorage değil).
// Mobil Safari/Chrome'da localStorage'ın bazı bağlamlarda güvenilir
// kalmaması nedeniyle "giriş yap → hemen girişe geri atılma" sorunu
// yaşanıyordu. Çerez tabanlı saklama, Supabase'in Next.js için resmi
// önerdiği yöntem ve bu tür tarayıcıya-özgü tutarsızlıkları ortadan
// kaldırmak için tasarlandı.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAuth = createBrowserClient(supabaseUrl, supabaseAnonKey);
