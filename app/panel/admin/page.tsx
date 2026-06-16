'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type AdminData = {
  biz: { total: number; approved: number; pending: number };
  total: { view: number; phone: number; whatsapp: number; social: number };
  last30: { view: number; phone: number; whatsapp: number; social: number };
  topViewed: { name: string; slug: string; district: string; province: string; views: number }[];
  provinceDist: { name: string; count: number }[];
  categoryDist: { name: string; count: number }[];
  recentBiz: { name: string; slug: string; district: string; province: string; category: string; created_at: string }[];
  topSearches: { q: string; count: number }[];
  emptySearches: { q: string; count: number }[];
  totalSearches: number;
  topCategories: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
};

export default function AdminPanelPage() {
  const [key, setKey] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [indexMsg, setIndexMsg] = useState('');
  const [indexing, setIndexing] = useState(false);

  async function pingIndexNow() {
    setIndexMsg('');
    setIndexing(true);
    try {
      const res = await fetch('/api/indexnow-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const json = await res.json();
      if (json.ok) setIndexMsg(`${json.count} sayfa arama motorlarına bildirildi ✓`);
      else setIndexMsg('Bildirim başarısız.');
    } catch {
      setIndexMsg('Bağlantı hatası.');
    } finally {
      setIndexing(false);
    }
  }

  async function login() {
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
      } else {
        setErr(res.status === 401 ? 'Hatalı şifre.' : 'Bir hata oluştu.');
      }
    } catch {
      setErr('Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  }

  // Giriş ekranı
  if (!data) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: 380, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, color: '#0e2148', marginBottom: 8 }}>Yönetim</h1>
          <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Devam etmek için şifre girin.</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            placeholder="Şifre"
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: 10, fontSize: 15, marginBottom: 12 }}
          />
          <button
            onClick={login}
            disabled={loading || !key}
            style={{ width: '100%', padding: '12px', background: '#0e2148', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading || !key ? 0.6 : 1 }}
          >
            {loading ? 'Kontrol ediliyor…' : 'Giriş'}
          </button>
          {err && <p style={{ color: '#c0392b', marginTop: 12, fontSize: 14 }}>{err}</p>}
        </div>
        <Footer />
      </>
    );
  }

  // İstatistik ekranı
  const fmtDate = (s: string) => {
    try { return new Date(s).toLocaleDateString('tr-TR'); } catch { return s; }
  };

  const card: React.CSSProperties = { background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 18 };
  const statBox: React.CSSProperties = { textAlign: 'center', padding: '14px 8px', background: '#f7f8fa', borderRadius: 12 };
  const bigNum: React.CSSProperties = { fontSize: 28, fontWeight: 800, color: '#0e2148', display: 'block' };
  const lbl: React.CSSProperties = { fontSize: 12, color: '#666', marginTop: 4 };

  return (
    <>
      <Header />
      <div style={{ maxWidth: 1000, margin: '24px auto 60px', padding: '0 18px', lineHeight: 1.5 }}>
        <h1 style={{ fontSize: 24, color: '#0e2148', marginBottom: 20 }}>Yönetim Paneli</h1>

        <div style={{ marginBottom: 20, padding: 14, background: '#f7f8fa', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={pingIndexNow}
            disabled={indexing}
            style={{ padding: '10px 16px', background: '#0e2148', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: indexing ? 0.6 : 1 }}
          >
            {indexing ? 'Bildiriliyor…' : '🔄 Tüm sayfaları arama motorlarına bildir'}
          </button>
          {indexMsg && <span style={{ fontSize: 13, color: '#27ae60', fontWeight: 600 }}>{indexMsg}</span>}
        </div>

        {/* İşletme özeti */}
        <div style={{ ...card, marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, color: '#0e2148', marginBottom: 14 }}>İşletmeler</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <div style={statBox}><span style={bigNum}>{data.biz.total}</span><div style={lbl}>Toplam işletme</div></div>
            <div style={statBox}><span style={{ ...bigNum, color: '#27ae60' }}>{data.biz.approved}</span><div style={lbl}>Yayında</div></div>
            <div style={statBox}><span style={{ ...bigNum, color: '#e67e22' }}>{data.biz.pending}</span><div style={lbl}>İncelemede</div></div>
          </div>
        </div>

        {/* Etkinlik - son 30 gün */}
        <div style={{ ...card, marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, color: '#0e2148', marginBottom: 14 }}>Etkinlik · Son 30 Gün</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            <div style={statBox}><span style={bigNum}>{data.last30.view}</span><div style={lbl}>Görüntülenme</div></div>
            <div style={statBox}><span style={bigNum}>{data.last30.phone}</span><div style={lbl}>Telefon</div></div>
            <div style={statBox}><span style={bigNum}>{data.last30.whatsapp}</span><div style={lbl}>WhatsApp</div></div>
            <div style={statBox}><span style={bigNum}>{data.last30.social}</span><div style={lbl}>Sosyal/Web</div></div>
          </div>
          <p style={{ fontSize: 13, color: '#888', marginTop: 12 }}>
            Tüm zamanlar: {data.total.view} görüntülenme · {data.total.phone} telefon · {data.total.whatsapp} WhatsApp · {data.total.social} sosyal/web
          </p>
        </div>

        {/* En çok görüntülenenler */}
        <div style={{ ...card, marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, color: '#0e2148', marginBottom: 14 }}>En Çok Görüntülenen İşletmeler · Son 30 Gün</h2>
          {data.topViewed.length === 0 ? (
            <p style={{ color: '#999', fontSize: 14 }}>Henüz görüntülenme verisi yok.</p>
          ) : (
            <div>
              {data.topViewed.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < data.topViewed.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <span style={{ fontSize: 14 }}>
                    <b style={{ color: '#c9a24b' }}>{i + 1}.</b> {b.name}
                    {b.district && <span style={{ color: '#999' }}> · {b.district}, {b.province}</span>}
                  </span>
                  <b style={{ fontSize: 14, color: '#0e2148' }}>{b.views}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ARAMA İSTATİSTİKLERİ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 18 }}>
          {/* En çok aranan */}
          <div style={card}>
            <h2 style={{ fontSize: 16, color: '#0e2148', marginBottom: 4 }}>En Çok Aranan Kelimeler</h2>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>Son 30 gün · Toplam {data.totalSearches} arama</p>
            {data.topSearches.length === 0 ? (
              <p style={{ color: '#999', fontSize: 14 }}>Henüz arama verisi yok.</p>
            ) : data.topSearches.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: '1px solid #f5f5f5' }}>
                <span>{s.q}</span><b style={{ color: '#0e2148' }}>{s.count}</b>
              </div>
            ))}
          </div>

          {/* Sonuç çıkmayan aramalar (KARŞILANMAMIŞ TALEP) */}
          <div style={{ ...card, border: '1px solid #f0d9b5', background: '#fffdf7' }}>
            <h2 style={{ fontSize: 16, color: '#b8860b', marginBottom: 4 }}>⚠ Sonuç Çıkmayan Aramalar</h2>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>Talep var, işletme yok — fırsat alanları</p>
            {data.emptySearches.length === 0 ? (
              <p style={{ color: '#999', fontSize: 14 }}>Sonuçsuz arama yok.</p>
            ) : data.emptySearches.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: '1px solid #f5ecd5' }}>
                <span>{s.q}</span><b style={{ color: '#b8860b' }}>{s.count}</b>
              </div>
            ))}
          </div>
        </div>

        {/* SAYFA GÖRÜNTÜLEME (neye bakıldı) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 18 }}>
          <div style={card}>
            <h2 style={{ fontSize: 16, color: '#0e2148', marginBottom: 14 }}>En Çok Bakılan Kategoriler</h2>
            {data.topCategories.length === 0 ? (
              <p style={{ color: '#999', fontSize: 14 }}>Henüz veri yok.</p>
            ) : data.topCategories.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: '1px solid #f5f5f5' }}>
                <span>{c.name}</span><b style={{ color: '#0e2148' }}>{c.count}</b>
              </div>
            ))}
          </div>
          <div style={card}>
            <h2 style={{ fontSize: 16, color: '#0e2148', marginBottom: 14 }}>En Çok Bakılan Bölgeler</h2>
            {data.topLocations.length === 0 ? (
              <p style={{ color: '#999', fontSize: 14 }}>Henüz veri yok.</p>
            ) : data.topLocations.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: '1px solid #f5f5f5' }}>
                <span>{l.name}</span><b style={{ color: '#0e2148' }}>{l.count}</b>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 18 }}>
          {/* Şehir dağılımı */}
          <div style={card}>
            <h2 style={{ fontSize: 16, color: '#0e2148', marginBottom: 14 }}>İşletme · Şehir Dağılımı</h2>
            {data.provinceDist.slice(0, 12).map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: '1px solid #f5f5f5' }}>
                <span>{p.name}</span><b style={{ color: '#0e2148' }}>{p.count}</b>
              </div>
            ))}
          </div>

          {/* Kategori dağılımı */}
          <div style={card}>
            <h2 style={{ fontSize: 16, color: '#0e2148', marginBottom: 14 }}>İşletme · Kategori Dağılımı</h2>
            {data.categoryDist.slice(0, 12).map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: '1px solid #f5f5f5' }}>
                <span>{c.name}</span><b style={{ color: '#0e2148' }}>{c.count}</b>
              </div>
            ))}
          </div>
        </div>

        {/* Son eklenenler */}
        <div style={card}>
          <h2 style={{ fontSize: 16, color: '#0e2148', marginBottom: 14 }}>Son Eklenen İşletmeler</h2>
          {data.recentBiz.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, borderBottom: i < data.recentBiz.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <span>{b.name} <span style={{ color: '#999' }}>· {b.category}{b.district && ` · ${b.district}`}</span></span>
              <span style={{ color: '#999', fontSize: 13 }}>{fmtDate(b.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
