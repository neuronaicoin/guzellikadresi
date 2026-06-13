import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import BusinessCard from '@/components/BusinessCard';
import {
  getCategoriesWithCounts,
  getProvinces,
  getRecentBusinesses,
  getFeaturedBusinesses,
  getTotalBusinessCount,
} from '@/lib/queries';

export const revalidate = 600;

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

      <div style={{ background: 'linear-gradient(180deg,#fff,var(--navy-50))', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '4px 6px 4px 14px' }}>
            <span style={{ color: 'var(--muted)', fontSize: 17 }}>🔍</span>
            <input
              placeholder="Hizmet, işletme veya semt ara… (örn. lazer epilasyon Kadıköy)"
              style={{ flex: 1, border: 0, outline: 'none', fontSize: 15, padding: '11px 4px', background: 'transparent', fontFamily: 'inherit' }}
            />
            <button style={{ background: 'var(--navy)', color: '#fff', borderRadius: 9, padding: '10px 22px', fontWeight: 700, fontSize: 14.5, border: 0, cursor: 'pointer' }}>Ara</button>
          </div>
        </div>
      </div>

      <div className="ga-wrap">
        <Sidebar categories={categories} provinces={provinces} />

        <main style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section className="ga-hero">
            <span className="ga-eyebrow">✦ Türkiye'nin güzellik & bakım rehberi</span>
            <h1 style={{ fontSize: 30, lineHeight: 1.18, letterSpacing: '-.6px', fontWeight: 800, maxWidth: 560, margin: 0 }}>
              Yakınındaki <span style={{ color: 'var(--gold)' }}>güzellik ve bakım uzmanını</span> dakikalar içinde bul
            </h1>
            <p style={{ marginTop: 10, color: '#c5cde0', fontSize: 15, maxWidth: 500 }}>
              Güzellik merkezi, kuaför, tırnak, saç ekimi, medikal estetik ve daha fazlası — ücretsiz ara, karşılaştır, ulaş.
            </p>
            <div style={{ display: 'flex', gap: 26, marginTop: 22 }}>
              <Stat n={total > 0 ? `${total}+` : '—'} l="Kayıtlı işletme" />
              <Stat n="13" l="Hizmet kategorisi" />
              <Stat n="81" l="İl genelinde" />
            </div>
          </section>

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
