import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import BusinessCard from '@/components/BusinessCard';
import HeroRotator from '@/components/HeroRotator';
import SearchBar from '@/components/SearchBar';
import DiscoverMobile from '@/components/DiscoverMobile';
import {
  getCategoriesWithCounts,
  getProvinces,
  getRecentBusinesses,
  getFeaturedBusinesses,
  getTotalBusinessCount,
} from '@/lib/queries';

export const revalidate = 600; // 10 dk cache (hız)

export default async function HomePage() {
  const [categories, provinces, recent, featured, total] = await Promise.all([
    getCategoriesWithCounts(),
    getProvinces(),
    getRecentBusinesses(),
    getFeaturedBusinesses(),
    getTotalBusinessCount(),
  ]);

  return (
    <>
      <Header />

      {/* ARAMA ŞERİDİ — masaüstünde görünür, mobilde gizli (mobilde keşfet akışı var) */}
      <div className="ga-searchbar-strip" style={{ background: 'linear-gradient(180deg,#fff,var(--navy-50))', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 22px' }}>
          <SearchBar />
        </div>
      </div>

      {/* MOBİL KEŞİF — sadece mobilde görünür (konum + kategoriler) */}
      <div className="ga-discover-mobile-only">
        <DiscoverMobile categories={categories} provinces={provinces} />
      </div>

      {/* LAYOUT */}
      <div className="ga-wrap">
        <Sidebar categories={categories} provinces={provinces} />

        <main style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* HERO */}
          <section className="ga-hero">
            <span className="ga-eyebrow">✦ Türkiye'nin güzellik & bakım adresi</span>
            <h1 style={{ fontSize: 30, lineHeight: 1.18, letterSpacing: '-.6px', fontWeight: 800, maxWidth: 560, margin: '0 0 0 0' }}>
              Bölgendeki <span style={{ color: 'var(--gold)' }}>güzellik ve bakım merkezlerini</span> keşfet
            </h1>
            <HeroRotator />
            <div style={{ display: 'flex', gap: 26, marginTop: 22 }}>
              <Stat n={total > 0 ? `${total}+` : '—'} l="Kayıtlı işletme" />
              <Stat n="13" l="Hizmet kategorisi" />
              <Stat n="81" l="İl genelinde" />
            </div>
          </section>

          {/* POPÜLER KATEGORİLER */}
          <section>
            <div className="ga-sec-head"><h2 className="ga-h2">Popüler kategoriler</h2></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {categories.slice(0, 10).map((c) => (
                <a key={c.id} href={`/kategori/${c.slug}`} className="ga-qchip">
                  <span style={{ fontSize: 15 }}>{c.emoji}</span> {c.name}
                </a>
              ))}
            </div>
          </section>

          {/* AZ ÖNCE EKLENENLER */}
          <section>
            <div className="ga-sec-head">
              <h2 className="ga-h2"><span className="ga-live" /> Az önce eklenenler</h2>
            </div>
            {recent.length ? (
              <div className="ga-grid">
                {recent.map((b) => <BusinessCard key={b.id} b={b} isNew />)}
              </div>
            ) : (
              <EmptyState text="Henüz işletme eklenmedi. İlk ekleyen siz olun!" />
            )}
          </section>

          {/* ÖNE ÇIKANLAR */}
          {featured.length > 0 && (
            <section>
              <div className="ga-sec-head"><h2 className="ga-h2">⭐ Öne çıkan işletmeler</h2></div>
              <div className="ga-grid">
                {featured.map((b) => <BusinessCard key={b.id} b={b} isFeat />)}
              </div>
            </section>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <b style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{n}</b>
      <small style={{ fontSize: 12, color: '#aab8d4', fontWeight: 600 }}>{l}</small>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ background: '#fff', border: '1px dashed var(--gold-soft)', borderRadius: 14, padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
      {text} <a href="/isletme-ekle" style={{ color: 'var(--gold)', fontWeight: 700 }}>İşletme Ekle →</a>
    </div>
  );
}
