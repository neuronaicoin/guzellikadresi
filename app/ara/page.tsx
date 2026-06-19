import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BusinessCard from '@/components/BusinessCard';
import BackButton from '@/components/BackButton';
import SearchPanel from '@/components/SearchPanel';
import { searchBusinesses } from '@/lib/queries-search';
import { getProvincesForForm, getCategoriesForForm } from '@/lib/queries-form';
import { trackSearch } from '@/lib/track-server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ara',
  robots: { index: false },
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; il?: string; ilce?: string } }) {
  const term = (searchParams.q || '').trim();
  const provinceId = searchParams.il ? Number(searchParams.il) : undefined;
  const districtId = searchParams.ilce ? Number(searchParams.ilce) : undefined;

  // Arama terimi VEYA konum varsa: sonuçları göster
  if (term || provinceId || districtId) {
    const items = await searchBusinesses(term || ' ', { provinceId, districtId });
    if (term) await trackSearch(term, items.length);
    return (
      <>
        <Header />
        <div className="ga-list-wrap">
          <div style={{ marginBottom: 10 }}>
            <BackButton label="Yeni arama" />
          </div>
          <div className="ga-list-head">
            <h1>{term ? `"${term}" için sonuçlar` : 'Arama sonuçları'}</h1>
            <p><b>{items.length}</b> işletme bulundu</p>
          </div>
          {items.length === 0 ? (
            <div className="ga-list-empty">
              <div style={{ fontSize: 34, marginBottom: 10 }}>🔍</div>
              <h3>Sonuç bulunamadı</h3>
              <p>Aramanı veya bölgeni değiştirip tekrar dene.</p>
              <a href="/ara" className="ga-list-cta">← Yeni arama yap</a>
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

  // Arama yoksa: arama paneli (adım adım il/ilçe/kategori/hizmet)
  const provinces = await getProvincesForForm();
  const categories = await getCategoriesForForm();
  return (
    <>
      <Header />
      <div className="ga-explore-wrap">
        <SearchPanel provinces={provinces as any} categories={categories as any} />
      </div>
      <Footer />
    </>
  );
}
