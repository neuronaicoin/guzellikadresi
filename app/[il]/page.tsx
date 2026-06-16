import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingView from '@/components/ListingView';
import { getProvinceBySlug, getBusinessList } from '@/lib/queries-list';
import { trackPage } from '@/lib/track-server';

export const revalidate = 600;

export async function generateMetadata({ params }: { params: { il: string } }) {
  const prov = await getProvinceBySlug(params.il);
  if (!prov) return { title: 'Sayfa bulunamadı' };
  return {
    title: `${prov.name} Güzellik ve Bakım İşletmeleri`,
    description: `${prov.name} genelinde güzellik merkezi, kuaför, estetik, tırnak ve bakım işletmelerini keşfedin. Bölgenizdeki en iyi uzmanları bulun.`,
  };
}

export default async function ProvincePage({
  params,
  searchParams,
}: {
  params: { il: string };
  searchParams: { sayfa?: string };
}) {
  const prov = await getProvinceBySlug(params.il);
  if (!prov) notFound();

  await trackPage('il', prov.name, prov.slug);

  const page = Number(searchParams.sayfa) || 1;
  const { items, total, perPage } = await getBusinessList({ provinceId: prov.id, page });

  return (
    <>
      <Header />
      <ListingView
        title={`${prov.name} Güzellik & Bakım`}
        subtitle={`${prov.name} geneli`}
        items={items}
        total={total}
        perPage={perPage}
        page={page}
        basePath={`/${prov.slug}`}
      />
      <Footer />
    </>
  );
}
