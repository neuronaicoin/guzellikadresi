import Header from '@/components/Header';
import Footer from '@/components/Footer';
import YakinimdaClient from '@/components/YakinimdaClient';
import { getProvincesForForm } from '@/lib/queries-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Yakınımdaki Güzellik ve Bakım İşletmeleri',
  description: 'Bulunduğun ildeki güzellik merkezi, kuaför, lazer epilasyon, tırnak ve bakım işletmelerini keşfet.',
  robots: { index: false },
};

export default async function YakinimdaPage() {
  const provinces = await getProvincesForForm();
  return (
    <>
      <Header />
      <div className="ga-explore-wrap">
        <YakinimdaClient provinces={provinces as any} />
      </div>
      <Footer />
    </>
  );
}
