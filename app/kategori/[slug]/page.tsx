import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingView from '@/components/ListingView';
import CategoryFilter from '@/components/CategoryFilter';
import {
  getCategoryBySlug,
  getProvinceBySlug,
  getDistrictBySlug,
  getBusinessList,
} from '@/lib/queries-list';
import { getProvinces } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { trackPage } from '@/lib/track-server';

export const revalidate = 600;

export async function generateMetadata({ params, searchParams }: { params: { slug: string }; searchParams: { il?: string; ilce?: string } }) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) return { title: 'Kategori bulunamadı' };
  let loc = 'Türkiye Geneli';
  if (searchParams.il) {
    const prov = await getProvinceBySlug(searchParams.il);
    if (prov) {
      loc = prov.name;
      if (searchParams.ilce) {
        const dist = await getDistrictBySlug(prov.id, searchParams.ilce);
        if (dist) loc = `${dist.name}, ${prov.name}`;
      }
    }
  }
  return {
    title: `${loc} ${cat.name}`,
    description: `${loc} bölgesinde ${cat.name.toLowerCase()} işletmelerini keşfedin. En iyi uzmanları bulun, karşılaştırın, ulaşın.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sayfa?: string; il?: string; ilce?: string };
}) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) notFound();

  // Sayfa takibi (sadece filtresiz ana kategori görüntülemesi)
  if (!searchParams.il) await trackPage('kategori', cat.name, cat.slug);

  const page = Number(searchParams.sayfa) || 1;
  const provinces = await getProvinces();

  // URL'deki il/ilçe parametrelerini çöz
  let province = null;
  let district = null;
  let initialDistricts: any[] = [];
  if (searchParams.il) {
    province = await getProvinceBySlug(searchParams.il);
    if (province) {
      const { data } = await supabase
        .from('districts')
        .select('id, name, slug, province_id')
        .eq('province_id', province.id)
        .order('name');
      initialDistricts = data || [];
      if (searchParams.ilce) {
        district = await getDistrictBySlug(province.id, searchParams.ilce);
      }
    }
  }

  const { items, total, perPage } = await getBusinessList({
    categoryId: cat.id,
    provinceId: province?.id,
    districtId: district?.id,
    page,
  });

  // başlık ve alt başlık
  let locLabel = 'Türkiye geneli';
  if (district) locLabel = `${district.name}, ${province!.name}`;
  else if (province) locLabel = province.name;

  // pagination basePath (filtre parametrelerini koru)
  let basePath = `/kategori/${cat.slug}`;
  const qp: string[] = [];
  if (province) qp.push(`il=${province.slug}`);
  if (district) qp.push(`ilce=${district.slug}`);
  const baseWithFilter = qp.length ? `${basePath}?${qp.join('&')}` : basePath;

  return (
    <>
      <Header />
      <div className="ga-catfilter-wrap">
        <CategoryFilter
          categorySlug={cat.slug}
          provinces={provinces}
          currentProvince={province}
          currentDistrict={district}
          initialDistricts={initialDistricts}
        />
      </div>
      <ListingView
        title={`${cat.emoji || ''} ${cat.name}`}
        subtitle={locLabel}
        items={items}
        total={total}
        perPage={perPage}
        page={page}
        basePath={baseWithFilter}
      />
      <Footer />
    </>
  );
}
