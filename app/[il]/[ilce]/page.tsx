import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingView from '@/components/ListingView';
import { getProvinceBySlug, getDistrictBySlug, getBusinessList } from '@/lib/queries-list';
import { trackPage } from '@/lib/track-server';

export const revalidate = 600;

export async function generateMetadata({ params }: { params: { il: string; ilce: string } }) {
  const prov = await getProvinceBySlug(params.il);
  if (!prov) return { title: 'Sayfa bulunamadı' };
  const dist = await getDistrictBySlug(prov.id, params.ilce);
  if (!dist) return { title: 'Sayfa bulunamadı' };
  return {
    title: `${dist.name}, ${prov.name} — Güzellik ve Bakım İşletmeleri`,
    description: `${dist.name} (${prov.name}) bölgesindeki güzellik merkezi, kuaför, estetik ve bakım işletmelerini keşfedin. Yakınınızdaki uzmanları bulun.`,
  };
}

export default async function DistrictPage({
  params,
  searchParams,
}: {
  params: { il: string; ilce: string };
  searchParams: { sayfa?: string };
}) {
  const prov = await getProvinceBySlug(params.il);
  if (!prov) notFound();
  const dist = await getDistrictBySlug(prov.id, params.ilce);
  if (!dist) notFound();

  await trackPage('ilce', `${dist.name}, ${prov.name}`, `${prov.slug}/${dist.slug}`);

  const page = Number(searchParams.sayfa) || 1;
  const { items, total, perPage } = await getBusinessList({ provinceId: prov.id, districtId: dist.id, page });

  return (
    <>
      <Header />
      <ListingView
        title={`${dist.name} Güzellik & Bakım`}
        subtitle={`${dist.name}, ${prov.name}`}
        items={items}
        total={total}
        perPage={perPage}
        page={page}
        basePath={`/${prov.slug}/${dist.slug}`}
      />
      <Footer />
    </>
  );
}
