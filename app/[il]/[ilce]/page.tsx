import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingView from '@/components/ListingView';
import { getProvinceBySlug, getDistrictBySlug, getBusinessList } from '@/lib/queries-list';
import { siteConfig } from '@/lib/siteConfig';
import { trackPage } from '@/lib/track-server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { il: string; ilce: string } }) {
  const prov = await getProvinceBySlug(params.il);
  if (!prov) return { title: 'Sayfa bulunamadı' };
  const dist = await getDistrictBySlug(prov.id, params.ilce);
  if (!dist) return { title: 'Sayfa bulunamadı' };

  const title = `${dist.name} Güzellik Merkezi ve Bakım - ${prov.name} | ${siteConfig.brandName}`;
  const description = `${dist.name}, ${prov.name} bölgesindeki güzellik merkezi, kuaför, medikal estetik, lazer epilasyon, tırnak ve bakım işletmelerini ${siteConfig.brandName}'de keşfedin. ${prov.name} ${dist.name} yakınınızdaki güzellik adresini bulun.`;
  const url = `/${prov.slug}/${dist.slug}`;

  const keywords = [
    `${dist.name} güzellik merkezi`,
    `${dist.name} kuaför`,
    `${dist.name} ${prov.name} güzellik`,
    `${prov.name} ${dist.name} güzellik merkezi`,
    `yakınımdaki güzellik merkezi`,
    siteConfig.brandName,
    siteConfig.alternateName,
  ];

  // Boş ilçeyi noindex yap (Google cezasından korunma)
  const { total } = await getBusinessList({ provinceId: prov.id, districtId: dist.id, page: 1 });
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

  const base = siteConfig.url || 'https://guzellikadresin.com';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: base },
          { '@type': 'ListItem', position: 2, name: prov.name, item: `${base}/${prov.slug}` },
          { '@type': 'ListItem', position: 3, name: dist.name, item: `${base}/${prov.slug}/${dist.slug}` },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${base}/${prov.slug}/${dist.slug}`,
        name: `${dist.name} Güzellik ve Bakım İşletmeleri - ${prov.name}`,
        description: `${dist.name}, ${prov.name} bölgesindeki güzellik ve bakım işletmeleri.`,
        url: `${base}/${prov.slug}/${dist.slug}`,
        isPartOf: { '@id': `${base}/#website` },
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
        title={`${dist.name} Güzellik & Bakım`}
        subtitle={`${dist.name}, ${prov.name}`}
        items={items}
        total={total}
        perPage={perPage}
        page={page}
        basePath={`/${prov.slug}/${dist.slug}`}
      />

      {/* SEO içerik bloğu */}
      <section className="ga-seo-block" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 48px', lineHeight: 1.7, color: '#333' }}>
        <h2 style={{ fontSize: 22, marginBottom: 12, color: '#0e2148' }}>
          {dist.name} Güzellik Merkezi ve Bakım İşletmeleri - {prov.name}
        </h2>
        <p>
          {dist.name} ({prov.name}) bölgesinde güzellik merkezi, kuaför, medikal estetik,
          lazer epilasyon, tırnak studyosu, kalıcı makyaj ve daha birçok bakım hizmeti
          veren işletmeyi {siteConfig.brandName} olarak tek sayfada topladık.
          {dist.name}&apos;de yakınınızdaki güzellik adresini adres, telefon ve konum
          bilgileriyle kolayca bulabilirsiniz.
        </p>
      </section>

      <Footer />
    </>
  );
}
