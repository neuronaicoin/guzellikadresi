import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingView from '@/components/ListingView';
import SeoBlock from '@/components/SeoBlock';
import { getProvinceBySlug, getBusinessList } from '@/lib/queries-list';
import { getProvinceFacets } from '@/lib/queries-seo';
import { siteConfig } from '@/lib/siteConfig';
import { trackPage } from '@/lib/track-server';
import {
  SITE, OG_IMAGES, abs, ldJson, fitTitle, clampDesc, joinTr, trLower, catSeo, fillFaqs, GENERAL_FAQS,
  faqSchema, itemListSchema, breadcrumbSchema, relatedPosts,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: { params: { il: string }; searchParams: { sayfa?: string } }) {
  const prov = await getProvinceBySlug(params.il);
  if (!prov) return { title: 'Sayfa bulunamadı', robots: { index: false } };
  const [facets, { total }] = await Promise.all([
    getProvinceFacets(prov.id),
    getBusinessList({ provinceId: prov.id, page: 1 }),
  ]);
  const topD = facets.districts.slice(0, 3).map((d) => d.name);

  const title = fitTitle([
    `${prov.name} Güzellik Merkezleri ve Kuaförleri`,
    `${prov.name} Güzellik Merkezleri`,
  ]);
  const description = clampDesc(
    total > 0
      ? `${prov.name} güzellik merkezleri, kuaförler, lazer epilasyon ve medikal estetik: ${facets.districts.length ? `${facets.districts.length} ilçede ` : ''}${total} işletme${topD.length ? `, ${joinTr(topD)} başta olmak üzere` : ''}. Adres ve telefonlar.`
      : `${prov.name} güzellik merkezi, kuaför, lazer epilasyon ve bakım işletmeleri. ${prov.name} için işletmeler eklendikçe bu sayfa güncellenir.`
  );
  const page = Number(searchParams.sayfa) || 1;
  const canonical = abs(page > 1 ? `/${prov.slug}?sayfa=${page}` : `/${prov.slug}`);
  const ogTitle = typeof title === 'string' ? title : title.absolute;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: ogTitle, description, url: canonical, type: 'website', siteName: siteConfig.brandName, locale: 'tr_TR', images: OG_IMAGES },
    // İşletmesi olmayan il: ince içerik, sıralanmasın
    ...(total === 0 ? { robots: { index: false, follow: true } } : {}),
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
  const [{ items, total, perPage }, facets] = await Promise.all([
    getBusinessList({ provinceId: prov.id, page }),
    getProvinceFacets(prov.id),
  ]);
  const isEmpty = total === 0;
  const pageUrl = `${SITE}/${prov.slug}`;

  const paragraphs: string[] = [];
  if (!isEmpty) {
    paragraphs.push(
      `${prov.name} genelinde ${siteConfig.brandName}'de ${total} güzellik ve bakım işletmesi listeleniyor` +
        (facets.districts.length
          ? `. İşletmeler ${facets.districts.length} ilçeye dağılıyor; en çok seçenek ${joinTr(facets.districts.slice(0, 3).map((d) => `${d.name} (${d.count})`))} ilçelerinde.`
          : '.')
    );
    if (facets.categories.length) {
      paragraphs.push(
        `En çok işletme bulunan kategoriler ${joinTr(facets.categories.slice(0, 4).map((c) => `${trLower(c.name)} (${c.count})`))}. İlçe ve hizmet seçerek size en yakın adresi bulabilir, işletme sayfalarından adres, konum ve iletişim bilgilerine ulaşabilirsiniz.`
      );
    }
  } else {
    paragraphs.push(`${prov.name} için henüz listelenmiş bir işletme yok. ${prov.name} içinde güzellik veya bakım hizmeti veren bir işletmeyseniz ücretsiz ekleyebilirsiniz.`);
  }

  const faqs = fillFaqs(GENERAL_FAQS, prov.name);
  const posts = relatedPosts({ il: prov.slug, catSlug: facets.categories[0]?.slug, catName: facets.categories[0]?.name });

  const linkGroups = [
    {
      title: `${prov.name} ilçeleri`,
      links: facets.districts.slice(0, 20).map((d) => ({ href: `/${prov.slug}/${d.slug}`, label: `${d.name} güzellik merkezleri (${d.count})` })),
    },
    {
      title: `${prov.name} hizmet kategorileri`,
      links: facets.categories.map((c) => ({ href: `/kategori/${c.slug}?il=${prov.slug}`, label: `${prov.name} ${catSeo(c.slug, c.name).plural} (${c.count})` })),
    },
    { title: 'Rehber yazıları', links: posts.map((p) => ({ href: `/rehber/${p.slug}`, label: p.title })) },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema([
        { name: 'Ana Sayfa', path: '/' },
        { name: prov.name, path: `/${prov.slug}` },
      ]),
      {
        '@type': 'CollectionPage',
        '@id': pageUrl,
        name: `${prov.name} Güzellik Merkezleri ve Kuaförleri`,
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
        title={`${prov.name} Güzellik Merkezleri ve Kuaförleri`}
        subtitle={`${prov.name} geneli`}
        items={items}
        total={total}
        perPage={perPage}
        page={page}
        basePath={`/${prov.slug}`}
      />
      <SeoBlock
        heading={`${prov.name} Güzellik ve Bakım Rehberi`}
        paragraphs={paragraphs}
        faqs={isEmpty ? [] : faqs}
        linkGroups={linkGroups}
      />
      <Footer />
    </>
  );
}
