import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getProvinces } from '@/lib/queries';

export const revalidate = 3600;

export const metadata = {
  title: 'Şehirler',
  description: 'Türkiye genelinde 81 ilde güzellik ve bakım işletmelerini keşfedin. Şehrinizi seçin, bölgenizdeki uzmanları bulun.',
};

export default async function CitiesPage() {
  const provinces = await getProvinces();

  return (
    <>
      <Header />
      <div className="ga-list-wrap">
        <div className="ga-list-head">
          <h1>Şehirler</h1>
          <p>Şehrinizi seçin, bölgenizdeki güzellik ve bakım uzmanlarını keşfedin</p>
        </div>
        <div className="ga-city-grid">
          {provinces.map((p) => (
            <a key={p.id} href={`/${p.slug}`} className="ga-city-card">{p.name}</a>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
