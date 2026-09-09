'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseAuth } from '@/lib/supabase-auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolvedFromAuthEvent = false;

    // onAuthStateChange, abone olunur olunmaz mevcut oturumu (varsa) veya
    // yeni tamamlanmış bir girişi HEMEN bildirir — bu, ayrı bir getSession()
    // çağrısıyla yarışan iki kaynak yerine TEK, güvenilir kaynak olur.
    // Mobilde/uygulama-içi tarayıcılarda getSession()'ın localStorage'ı
    // henüz senkron okuyamadığı anlarda erken "user: null" görülüp
    // panelin girişe geri atması sorununun kök nedeni buydu.
    const { data: sub } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      resolvedFromAuthEvent = true;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Güvenlik ağı: bir sebeple onAuthStateChange hiç tetiklenmezse
    // (çok nadir), yine de getSession() ile son kontrolü yap.
    supabaseAuth.auth.getSession().then(({ data }) => {
      if (!resolvedFromAuthEvent) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}
