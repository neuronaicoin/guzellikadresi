import Header from '@/components/Header';
import Footer from '@/components/Footer';
import YakinimdaClient from '@/components/YakinimdaClient';
import { getProvincesForForm, getCategoriesForForm } from '@/lib/queries-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Yakınımdaki Güzellik ve Bakım İşletmeleri',
  description: 'Bulunduğun ildeki güzellik merkezi, kuaför, lazer epilasyon, tırnak ve bakım işletmelerini il, ilçe ve kategoriye göre keşfet.',
  robots: { index: false },
};

export default async function YakinimdaPage() {
  const [provinces, categories] = await Promise.all([
    getProvincesForForm(),
    getCategoriesForForm(),
  ]);
  return (
    <>
      <Header />
      <div className="ga-explore-wrap">
        <YakinimdaClient provinces={provinces as any} categories={categories as any} />
      </div>
      <Footer />
    </>
  );
}
