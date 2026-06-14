'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/useAuth';
import { supabaseAuth } from '@/lib/supabase-auth';

export default function PanelPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/giris');
  }, [loading, user, router]);

  async function cikis() {
    await supabaseAuth.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="ga-static-wrap"><p className="ga-static-lead">Yükleniyor…</p></div>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="ga-static-wrap">
        <h1>İşletme Paneli</h1>
        <p className="ga-static-lead">Hoş geldiniz, <b>{user.email}</b></p>

        <div className="ga-panel-card">
          <h2 style={{ marginTop: 0 }}>İşletmelerim</h2>
          <p>İşletme yönetimi yakında bu panelde olacak. Şimdilik işletmenizi ekleyebilirsiniz.</p>
          <a href="/isletme-ekle" className="ga-list-cta" style={{ marginTop: 12 }}>İşletme Ekle →</a>
        </div>

        <button onClick={cikis} className="ga-logout-btn">Çıkış Yap</button>
      </div>
      <Footer />
    </>
  );
}
