import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingView from '@/components/ListingView';
import {
  getProvinceBySlug,
  getDistrictBySlug,
  getCategoryBySlug,
  getBusinessList,
} from '@/lib/queries-list';
import { trackPage } from '@/lib/track-server';

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: { il: string; ilce: string; hizmet: string };
}) {
  const prov = await getProvinceBySlug(params.il);
  if (!prov) return { title: 'Sayfa bulunamadı' };
  const dist = await getDistrictBySlug(prov.id, params.ilce);
  if (!dist) return { title: 'Sayfa bulunamadı' };
  const cat = await getCategoryBySlug(params.hizmet);
  if (!cat) return { title: 'Sayfa bulunamadı' };

  const title = `${dist.name} ${cat.name} | En İyi Adresler`;
  const description = `${dist.name} (${prov.name}) bölgesinde ${cat.name.toLocaleLowerCase('tr-TR')} hizmeti veren işletmeleri keşfedin. Adresleri, telefonları ve konumlarıyla ${dist.name}'deki en iyi ${cat.name.toLocaleLowerCase('tr-TR')} adresleri burada.`;
  const url = `/${prov.slug}/${dist.slug}/${cat.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
  };
}

export default async function ServiceInDistrictPage({
  params,
  searchParams,
}: {
  params: { il: string; ilce: string; hizmet: string };
  searchParams: { sayfa?: string };
}) {
  const prov = await getProvinceBySlug(params.il);
  if (!prov) notFound();
  const dist = await getDistrictBySlug(prov.id, params.ilce);
  if (!dist) notFound();
  const cat = await getCategoryBySlug(params.hizmet);
  if (!cat) notFound();

  const page = Number(searchParams.sayfa) || 1;
  const { items, total, perPage } = await getBusinessList({
    provinceId: prov.id,
    districtId: dist.id,
    categoryId: cat.id,
    page,
  });

  // DOLU-SAYFA FİLTRESİ: bu ilçede bu hizmette hiç işletme yoksa, boş sayfa basma (404)
  if (total === 0) notFound();

  await trackPage('hizmet', `${dist.name} ${cat.name}`, `${prov.slug}/${dist.slug}/${cat.slug}`);

  const catLower = cat.name.toLocaleLowerCase('tr-TR');

  // BreadcrumbList + ItemList schema
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: '/' },
          { '@type': 'ListItem', position: 2, name: prov.name, item: `/${prov.slug}` },
          { '@type': 'ListItem', position: 3, name: dist.name, item: `/${prov.slug}/${dist.slug}` },
          { '@type': 'ListItem', position: 4, name: cat.name },
        ],
      },
    ],
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <ListingView
        title={`${dist.name} ${cat.name}`}
        subtitle={`${dist.name}, ${prov.name}`}
        items={items}
        total={total}
        perPage={perPage}
        page={page}
        basePath={`/${prov.slug}/${dist.slug}/${cat.slug}`}
      />

      {/* SEO içerik bloğu */}
      <section className="ga-seo-block" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 48px', lineHeight: 1.7, color: '#333' }}>
        <h2 style={{ fontSize: 22, marginBottom: 12, color: '#0e2148' }}>
          {dist.name}&apos;de {cat.name} Hakkında
        </h2>
        <p>
          {dist.name} ({prov.name}) bölgesinde {catLower} hizmeti arayanlar için
          en iyi adresleri bir araya getirdik. Bu sayfada {dist.name}&apos;de {catLower}{' '}
          hizmeti veren işletmeleri adresleri, telefon numaraları ve konumlarıyla
          birlikte bulabilir, size en yakın ve en uygun olanı kolayca seçebilirsiniz.
        </p>
        <p>
          Listelenen işletmeler arasından konumuna, sunduğu hizmetlere ve iletişim
          bilgilerine göz atarak ihtiyacınıza en uygun {catLower} adresini
          belirleyebilirsiniz. Yeni işletmeler eklendikçe bu liste güncellenir.
        </p>

        <h3 style={{ fontSize: 18, margin: '20px 0 10px', color: '#0e2148' }}>
          İlgili sayfalar
        </h3>
        <ul style={{ paddingLeft: 20 }}>
          <li>
            <a href={`/${prov.slug}/${dist.slug}`} style={{ color: '#c9a24b' }}>
              {dist.name}&apos;deki tüm güzellik ve bakım işletmeleri
            </a>
          </li>
          <li>
            <a href={`/kategori/${cat.slug}`} style={{ color: '#c9a24b' }}>
              Tüm {cat.name} işletmeleri
            </a>
          </li>
          <li>
            <a href={`/${prov.slug}`} style={{ color: '#c9a24b' }}>
              {prov.name} geneli işletmeler
            </a>
          </li>
        </ul>
      </section>

      <Footer />
    </>
  );
}
