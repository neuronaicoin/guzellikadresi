import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BusinessCard from '@/components/BusinessCard';
import SearchExplorer from '@/components/SearchExplorer';
import { searchBusinesses } from '@/lib/queries-search';
import { getCategoriesForForm, getProvincesForForm } from '@/lib/queries-form';

export const metadata = {
  title: 'Ara',
  robots: { index: false },
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const term = (searchParams.q || '').trim();

  // Arama terimi varsa: sonuçları göster
  if (term) {
    const items = await searchBusinesses(term);
    return (
      <>
        <Header />
        <div className="ga-list-wrap">
          <div className="ga-list-head">
            <h1>"{term}" için sonuçlar</h1>
            <p><b>{items.length}</b> işletme bulundu</p>
          </div>
          {items.length === 0 ? (
            <div className="ga-list-empty">
              <div style={{ fontSize: 34, marginBottom: 10 }}>🔍</div>
              <h3>Sonuç bulunamadı</h3>
              <p>"{term}" için işletme bulunamadı. Kategorilerden arayın.</p>
              <a href="/ara" className="ga-list-cta">Kategorilere Göz At →</a>
            </div>
          ) : (
            <div className="ga-grid">
              {items.map((b) => <BusinessCard key={b.id} b={b} />)}
            </div>
          )}
        </div>
        <Footer />
      </>
    );
  }

  // Arama terimi yoksa: sahibinden tarzı kategori>hizmet>konum keşfi
  const [categories, provinces] = await Promise.all([
    getCategoriesForForm(),
    getProvincesForForm(),
  ]);

  return (
    <>
      <Header />
      <div className="ga-explore-wrap">
        <SearchExplorer categories={categories as any} provinces={provinces} />
      </div>
      <Footer />
    </>
  );
}
