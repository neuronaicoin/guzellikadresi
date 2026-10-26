import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategoriesWithCounts } from '@/lib/queries';

export const revalidate = 600;

export const metadata = {
  title: 'Tüm Güzellik ve Bakım Kategorileri',
  description: 'Güzellik merkezi, lazer epilasyon, kuaför, medikal estetik, saç ekimi, tırnak stüdyosu, kalıcı makyaj ve spa: tüm kategoriler ve işletme sayıları tek sayfada.',
  alternates: { canonical: 'https://guzellikadresin.com/kategoriler' },
};

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <>
      <Header />
      <div className="ga-list-wrap">
        <div className="ga-list-head">
          <h1>Tüm Kategoriler</h1>
          <p>Aradığınız güzellik ve bakım hizmetini seçin</p>
        </div>
        <div className="ga-cat-grid">
          {categories.map((c) => (
            <a key={c.id} href={`/kategori/${c.slug}`} className="ga-cat-card">
              <span className="ga-cat-card-emoji">{c.emoji}</span>
              <span className="ga-cat-card-name">{c.name}</span>
              <span className="ga-cat-card-count">{c.business_count ?? 0} işletme</span>
            </a>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
