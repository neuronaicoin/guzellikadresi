import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BusinessCard from '@/components/BusinessCard';
import { searchBusinesses } from '@/lib/queries-search';

export const metadata = {
  title: 'Arama Sonuçları',
  robots: { index: false },
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const term = (searchParams.q || '').trim();
  const items = term ? await searchBusinesses(term) : [];

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
            <p>"{term}" için işletme bulunamadı. Farklı bir arama deneyin veya kategorilere göz atın.</p>
            <a href="/kategoriler" className="ga-list-cta">Kategorilere Göz At →</a>
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
