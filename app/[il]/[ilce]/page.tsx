import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingView from '@/components/ListingView';
import SeoBlock from '@/components/SeoBlock';
import { getProvinceBySlug, getDistrictBySlug, getBusinessList } from '@/lib/queries-list';
import { getProvinceFacets } from '@/lib/queries-seo';
import { siteConfig } from '@/lib/siteConfig';
import { trackPage } from '@/lib/track-server';
import {
  SITE, OG_IMAGES, abs, ldJson, fitTitle, clampDesc, joinTr, trLower, catSeo, fillFaqs, GENERAL_FAQS,
  faqSchema, itemListSchema, breadcrumbSchema, relatedPosts,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { il: string; ilce: string };
  searchParams: { sayfa?: string };
}) {
  const prov = await getProvinceBySlug(params.il);
  if (!prov) return { title: 'Sayfa bulunamadı', robots: { index: false } };
  const dist = await getDistrictBySlug(prov.id, params.ilce);
  if (!dist) return { title: 'Sayfa bulunamadı', robots: { index: false } };

  const [facets, { total }] = await Promise.all([
    getProvinceFacets(prov.id),
    getBusinessList({ provinceId: prov.id, districtId: dist.id, page: 1 }),
  ]);
  const cats = (facets.byDistrict[dist.slug] || []).slice(0, 3).map((c) => trLower(c.name));

  const title = fitTitle([
    `${dist.name} Güzellik Merkezleri ve Kuaförleri`,
    `${dist.name} Güzellik Merkezleri - ${prov.name}`,
    `${dist.name} Güzellik Merkezleri`,
  ]);
  const description = clampDesc(
    total > 0
      ? `${dist.name} güzellik merkezi ve kuaför adresleri: ${prov.name} ${dist.name} bölgesinde ${total} işletme${cats.length ? ` (${joinTr(cats)})` : ''}. Adres, telefon ve konum bilgileri.`
      : `${dist.name} (${prov.name}) güzellik merkezi, kuaför ve bakım işletmeleri. Bu ilçede henüz kayıtlı işletme yok; yakın ilçelere göz atın.`
  );
  const page = Number(searchParams.sayfa) || 1;
  const path = `/${prov.slug}/${dist.slug}`;
  const canonical = abs(page > 1 ? `${path}?sayfa=${page}` : path);
  const ogTitle = typeof title === 'string' ? title : title.absolute;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: ogTitle, description, url: canonical, type: 'website', siteName: siteConfig.brandName, locale: 'tr_TR', images: OG_IMAGES },
    // Boş ilçeyi noindex yap (ince içerik)
    ...(total === 0 ? { robots: { index: false, follow: true } } : {}),
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
  const [{ items, total, perPage }, facets] = await Promise.all([
    getBusinessList({ provinceId: prov.id, districtId: dist.id, page }),
    getProvinceFacets(prov.id),
  ]);

  const path = `/${prov.slug}/${dist.slug}`;
  const pageUrl = `${SITE}${path}`;
  const catsHere = facets.byDistrict[dist.slug] || [];
  const otherDistricts = facets.districts.filter((d) => d.slug !== dist.slug);
  const isEmpty = total === 0;

  const paragraphs: string[] = [];
  if (!isEmpty) {
    paragraphs.push(
      `${dist.name} (${prov.name}) bölgesinde ${siteConfig.brandName}'de ${total} güzellik ve bakım işletmesi listeleniyor` +
        (catsHere.length
          ? `. En çok işletme bulunan kategoriler: ${joinTr(catsHere.slice(0, 4).map((c) => `${trLower(c.name)} (${c.count})`))}.`
          : '.')
    );
  } else {
    paragraphs.push(`${dist.name} (${prov.name}) bölgesinde henüz listelenmiş bir işletme yok. ${prov.name} genelindeki işletmelere ve aşağıdaki ilçelere göz atabilirsiniz.`);
  }
  if (facets.total > 0) {
    paragraphs.push(
      `${prov.name} genelinde ${facets.districts.length} ilçede toplam ${facets.total} işletme bulunuyor` +
        (otherDistricts.length ? `; komşu arama için ${joinTr(otherDistricts.slice(0, 3).map((d) => d.name))} ilçelerine de bakabilirsiniz.` : '.')
    );
  }
  paragraphs.push(
    'Bir işletmeyi seçmeden önce sayfasındaki hizmet listesine, fotoğraflara ve konuma göz atın; hijyen koşullarını, uygulamayı yapan kişinin deneyimini ve fiyata nelerin dahil olduğunu telefonla sormak en sağlıklı yoldur.'
  );

  const faqs = fillFaqs(GENERAL_FAQS, dist.name);
  const posts = relatedPosts({ il: prov.slug, ilce: dist.slug, catSlug: catsHere[0]?.slug, catName: catsHere[0]?.name });

  const linkGroups = [
    {
      title: `${dist.name} hizmet kategorileri`,
      links: catsHere.map((c) => ({ href: `/${prov.slug}/${dist.slug}/${c.slug}`, label: `${dist.name} ${catSeo(c.slug, c.name).plural} (${c.count})` })),
    },
    {
      title: `${prov.name} içindeki diğer ilçeler`,
      links: otherDistricts.slice(0, 12).map((d) => ({ href: `/${prov.slug}/${d.slug}`, label: `${d.name} güzellik merkezleri (${d.count})` })),
    },
    {
      title: 'İlgili sayfalar',
      links: [{ href: `/${prov.slug}`, label: `${prov.name} güzellik merkezleri ve kuaförleri` }, { href: '/kategoriler', label: 'Tüm kategoriler' }],
    },
    { title: 'Rehber yazıları', links: posts.map((p) => ({ href: `/rehber/${p.slug}`, label: p.title })) },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema([
        { name: 'Ana Sayfa', path: '/' },
        { name: prov.name, path: `/${prov.slug}` },
        { name: dist.name, path },
      ]),
      {
        '@type': 'CollectionPage',
        '@id': pageUrl,
        name: `${dist.name} Güzellik Merkezleri ve Kuaförleri - ${prov.name}`,
        url: pageUrl,
        inLanguage: 'tr-TR',
        isPartOf: { '@id': `${SITE}/#website` },
        ...(items.length ? { mainEntity: itemListSchema(items, total) } : {}),
      },
      ...(isEmpty ? [] : [faqSchema(faqs)]),
    ],
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(schema) }} />
      <ListingView
        title={`${dist.name} Güzellik Merkezleri ve Kuaförleri`}
        subtitle={`${dist.name}, ${prov.name}`}
        items={items}
        total={total}
        perPage={perPage}
        page={page}
        basePath={path}
      />

      <SeoBlock
        heading={`${dist.name} Güzellik ve Bakım İşletmeleri - ${prov.name}`}
        paragraphs={paragraphs}
        faqs={isEmpty ? [] : faqs}
        linkGroups={linkGroups}
      />

      <Footer />
    </>
  );
}
