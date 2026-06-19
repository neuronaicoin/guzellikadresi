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
import { siteConfig } from '@/lib/siteConfig';
import { trackPage } from '@/lib/track-server';

export const dynamic = 'force-dynamic';

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

  const catLower = cat.name.toLocaleLowerCase('tr-TR');
  // Başlıkta İLÇE + KATEGORİ + İL + MARKA (tam eşleşme aramaları için)
  const title = `${dist.name} ${cat.name} - ${prov.name} | ${siteConfig.brandName}`;
  const description = `${dist.name}, ${prov.name} bölgesinde ${catLower} arıyorsanız doğru yerdesiniz. ${dist.name} ${catLower} adresleri, telefonları ve konumlarıyla ${siteConfig.brandName}'de. ${prov.name} ${dist.name} en iyi ${catLower} işletmelerini ücretsiz keşfedin.`;
  const url = `/${prov.slug}/${dist.slug}/${cat.slug}`;

  // Sayfaya özel anahtar kelimeler
  const keywords = [
    `${dist.name} ${catLower}`,
    `${prov.name} ${catLower}`,
    `${dist.name} ${prov.name} ${catLower}`,
    `${dist.name} ${catLower} fiyatları`,
    `${dist.name} en iyi ${catLower}`,
    `yakınımdaki ${catLower}`,
    catLower,
    siteConfig.brandName,
    siteConfig.alternateName,
  ];

  // Bu kombinasyonda işletme var mı? Yoksa Google sıralamasın (noindex)
  const { total } = await getBusinessList({ provinceId: prov.id, districtId: dist.id, categoryId: cat.id, page: 1 });
  const robots = total === 0 ? { index: false, follow: true } : undefined;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: siteConfig.brandName },
    ...(robots ? { robots } : {}),
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

  const isEmpty = total === 0;

  await trackPage('hizmet', `${dist.name} ${cat.name}`, `${prov.slug}/${dist.slug}/${cat.slug}`);

  const catLower = cat.name.toLocaleLowerCase('tr-TR');
  const base = siteConfig.url || 'https://guzellikadresin.com';
  const pageUrl = `${base}/${prov.slug}/${dist.slug}/${cat.slug}`;

  // BreadcrumbList + Service + CollectionPage schema (AI/Google için zengin)
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: base },
          { '@type': 'ListItem', position: 2, name: prov.name, item: `${base}/${prov.slug}` },
          { '@type': 'ListItem', position: 3, name: dist.name, item: `${base}/${prov.slug}/${dist.slug}` },
          { '@type': 'ListItem', position: 4, name: cat.name, item: pageUrl },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': pageUrl,
        name: `${dist.name} ${cat.name} - ${prov.name}`,
        description: `${dist.name}, ${prov.name} bölgesinde ${catLower} hizmeti veren işletmeler.`,
        url: pageUrl,
        isPartOf: { '@id': `${base}/#website` },
        about: {
          '@type': 'Service',
          name: cat.name,
          serviceType: cat.name,
          areaServed: {
            '@type': 'AdministrativeArea',
            name: `${dist.name}, ${prov.name}`,
          },
          provider: { '@id': `${base}/#organization` },
        },
        ...(total > 0
          ? {
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: total,
                itemListElement: items.slice(0, 10).map((b: any, i: number) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  item: {
                    '@type': 'LocalBusiness',
                    name: b.name,
                    address: {
                      '@type': 'PostalAddress',
                      addressLocality: dist.name,
                      addressRegion: prov.name,
                      addressCountry: 'TR',
                    },
                    ...(b.slug ? { url: `${base}/isletme/${b.slug}` } : {}),
                  },
                })),
              },
            }
          : {}),
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

      {isEmpty && (
        <section style={{ maxWidth: 700, margin: '0 auto', padding: '30px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: '#0e2148', fontWeight: 700, marginBottom: 10 }}>
            {dist.name}&apos;de henüz {catLower} işletmesi eklenmemiş
          </p>
          <p style={{ fontSize: 15, color: '#666', marginBottom: 20 }}>
            Bu bölgede {catLower} hizmeti veren bir işletme misiniz? Ücretsiz ekleyin,
            müşterileriniz sizi kolayca bulsun.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/isletme-ekle" style={{ padding: '11px 20px', background: '#c9a24b', color: '#0e2148', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              İşletmeni ücretsiz ekle →
            </a>
            <a href={`/kategori/${cat.slug}`} style={{ padding: '11px 20px', background: '#f0f0f0', color: '#0e2148', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Tüm {cat.name} işletmeleri
            </a>
            <a href={`/${prov.slug}`} style={{ padding: '11px 20px', background: '#f0f0f0', color: '#0e2148', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              {prov.name} geneli
            </a>
          </div>
        </section>
      )}

      {/* SEO içerik bloğu */}
      <section className="ga-seo-block" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 48px', lineHeight: 1.7, color: '#333' }}>
        <h2 style={{ fontSize: 22, marginBottom: 12, color: '#0e2148' }}>
          {dist.name} {cat.name} - {prov.name}
        </h2>
        <p>
          {dist.name} ({prov.name}) bölgesinde {catLower} hizmeti arayanlar için
          en iyi adresleri {siteConfig.brandName} olarak bir araya getirdik. Bu sayfada {dist.name}&apos;de {catLower}{' '}
          hizmeti veren işletmeleri adresleri, telefon numaraları ve konumlarıyla
          birlikte bulabilir, size en yakın ve en uygun olanı kolayca seçebilirsiniz.
        </p>
        <p>
          {prov.name} {dist.name} bölgesinde {catLower} arıyorsanız, listelenen işletmeler
          arasından konuma, sunulan hizmetlere ve iletişim bilgilerine göz atarak
          ihtiyacınıza en uygun {catLower} adresini belirleyebilirsiniz. Yeni işletmeler
          eklendikçe bu liste güncellenir.
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
