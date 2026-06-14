'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseAuth } from '@/lib/supabase-auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseAuth.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}
