'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/useAuth';
import { supabaseAuth } from '@/lib/supabase-auth';
import { getMyBusinesses, getBusinessStats, type MyBusiness, type BizStats } from '@/lib/queries-panel';
export default function PanelPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<MyBusiness[]>([]);
  const [stats, setStats] = useState<Record<string, BizStats>>({});
  const [bizLoading, setBizLoading] = useState(true);
  useEffect(() => {
    if (!loading && !user) { router.push('/giris'); return; }
    if (user) {
      getMyBusinesses(user.id).then(async (data) => {
        setItems(data);
        setBizLoading(false);
        // her işletme için istatistik çek
        const statsMap: Record<string, BizStats> = {};
        await Promise.all(data.map(async (b) => {
          statsMap[b.id] = await getBusinessStats(b.id);
        }));
        setStats(statsMap);
      });
    }
  }, [loading, user, router]);
  async function cikis() {
    await supabaseAuth.auth.signOut();
    router.push('/');
  }
  if (loading || (user && bizLoading)) {
    return (
      <>
        <Header />
        <div className="ga-static-wrap"><p className="ga-static-lead">Yükleniyor…</p></div>
        <Footer />
      </>
    );
  } if (!user) return null;
  return (
    <>
      <Header />
      <div className="ga-panel-wrap">
        <div className="ga-panel-top">
          <div>
            <h1>İşletme Paneli</h1>
            <p className="ga-panel-mail">{user.email}</p>
          </div>
          <button onClick={cikis} className="ga-logout-btn">Çıkış Yap</button>
        </div>
        <div className="ga-panel-section-head">
          <h2>İşletmelerim</h2>
          <a href="/isletme-ekle" className="ga-panel-add">+ Yeni İşletme</a>
        </div>
        {items.length === 0 ? (
          <div className="ga-list-empty">
            <div style={{ fontSize: 34, marginBottom: 10 }}>🏪</div>
            <h3>Henüz işletmeniz yok</h3>
            <p>İlk işletmenizi ekleyin, müşterilerle buluşmaya başlayın.</p>
            <a href="/isletme-ekle" className="ga-list-cta">İşletme Ekle →</a>
          </div>
        ) : (
          <div className="ga-mybiz-list">
            {items.map((b) => {
              const st = stats[b.id];
              return (
              <div key={b.id} className="ga-mybiz-card-wrap">
                <div className="ga-mybiz-card">
                  <div className="ga-mybiz-cover" style={{ backgroundImage: b.cover_url ? `url(${b.cover_url})` : 'none' }}>
                    {!b.cover_url && <span>📷</span>}
                  </div>
                  <div className="ga-mybiz-info">
                    <div className="ga-mybiz-name">{b.name}</div>
                    <div className="ga-mybiz-meta">
                      {b.category_name && <span>{b.category_name}</span>}
                      {b.district_name && <span> · {b.district_name}, {b.province_name}</span>}
                    </div>
                    <span className={`ga-mybiz-status ${b.status === 'approved' ? 'ok' : 'pending'}`}>
                      {b.status === 'approved' ? '● Yayında' : '● İncelemede'}
                    </span>
                  </div>
                  <div className="ga-mybiz-actions">
                    <a href={`/isletme/${b.slug}`} className="ga-mybiz-btn">Görüntüle</a>
                    <a href={`/panel/randevu/${b.id}`} className="ga-mybiz-btn">📅 Randevu</a>
                    <a href={`/panel/duzenle/${b.id}`} className="ga-mybiz-btn primary">Düzenle</a>
                  </div>
                </div>
   {/* İstatistikler */}
                <div className="ga-stats">
                  <div className="ga-stat">
                    <span className="ga-stat-num">{st ? st.views30 : '…'}</span>
                    <span className="ga-stat-lbl">Görüntülenme<small>son 30 gün</small></span>
                  </div>
                  <div className="ga-stat">
                    <span className="ga-stat-num">{st ? st.phone30 : '…'}</span>
                    <span className="ga-stat-lbl">Telefon tıklama<small>son 30 gün</small></span>
                  </div>
                  <div className="ga-stat">
                    <span className="ga-stat-num">{st ? st.whatsapp30 : '…'}</span>
                    <span className="ga-stat-lbl">WhatsApp tıklama<small>son 30 gün</small></span>
                  </div>
                  <div className="ga-stat">
                    <span className="ga-stat-num">{st ? st.social30 : '…'}</span>
                    <span className="ga-stat-lbl">Sosyal medya<small>son 30 gün</small></span>
                  </div>
                  <div className="ga-stat ga-stat-hl">
                    <span className="ga-stat-num">{st ? (st.phone30 + st.whatsapp30) : '…'}</span>
                    <span className="ga-stat-lbl">Siteden ulaşan<small>son 30 gün</small></span>
                  </div>
                  <div className="ga-stat ga-stat-hl">
                    <span className="ga-stat-num">{st ? st.reachTotal : '…'}</span>
                    <span className="ga-stat-lbl">Toplam ulaşan<small>tüm zamanlar</small></span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
