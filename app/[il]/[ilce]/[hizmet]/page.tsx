import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingView from '@/components/ListingView';
import SeoBlock from '@/components/SeoBlock';
import {
  getProvinceBySlug,
  getDistrictBySlug,
  getCategoryBySlug,
  getBusinessList,
} from '@/lib/queries-list';
import { getProvinceFacets } from '@/lib/queries-seo';
import { siteConfig } from '@/lib/siteConfig';
import { trackPage } from '@/lib/track-server';
import {
  SITE, OG_IMAGES, abs, ldJson, fitTitle, clampDesc, joinTr, trLower, catSeo, fillFaqs,
  faqSchema, itemListSchema, breadcrumbSchema, relatedPosts,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

async function load(params: { il: string; ilce: string; hizmet: string }) {
  const prov = await getProvinceBySlug(params.il);
  if (!prov) return null;
  const [dist, cat] = await Promise.all([getDistrictBySlug(prov.id, params.ilce), getCategoryBySlug(params.hizmet)]);
  if (!dist || !cat) return null;
  return { prov, dist, cat };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { il: string; ilce: string; hizmet: string };
  searchParams: { sayfa?: string };
}) {
  const r = await load(params);
  if (!r) return { title: 'Sayfa bulunamadı', robots: { index: false } };
  const { prov, dist, cat } = r;
  const seo = catSeo(cat.slug, cat.name);
  const catLower = trLower(cat.name);

  const { total } = await getBusinessList({ provinceId: prov.id, districtId: dist.id, categoryId: cat.id, page: 1 });

  const title = fitTitle([
    `${dist.name} ${seo.plural} - ${prov.name}`,
    `${dist.name} ${seo.plural}`,
    `${dist.name} ${cat.name}`,
  ]);
  const description = clampDesc(
    total > 0
      ? `${dist.name} ${catLower}: ${prov.name} ${dist.name} bölgesindeki ${total} ${catLower} işletmesinin adresi, telefonu ve konumu; seçerken sorulacaklar ve SSS.`
      : `${dist.name} ${catLower} işletmeleri (${prov.name}). Bu bölgede henüz kayıtlı işletme yok; yakın ilçelerdeki ${catLower} adreslerine göz atın.`
  );
  const page = Number(searchParams.sayfa) || 1;
  const path = `/${prov.slug}/${dist.slug}/${cat.slug}`;
  const canonical = abs(page > 1 ? `${path}?sayfa=${page}` : path);
  const ogTitle = typeof title === 'string' ? title : title.absolute;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: ogTitle, description, url: canonical, type: 'website', siteName: siteConfig.brandName, locale: 'tr_TR', images: OG_IMAGES },
    // Bu kombinasyonda işletme yoksa Google sıralamasın (noindex)
    ...(total === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ServiceInDistrictPage({
  params,
  searchParams,
}: {
  params: { il: string; ilce: string; hizmet: string };
  searchParams: { sayfa?: string };
}) {
  const r = await load(params);
  if (!r) notFound();
  const { prov, dist, cat } = r;

  const page = Number(searchParams.sayfa) || 1;
  const [{ items, total, perPage }, facets] = await Promise.all([
    getBusinessList({ provinceId: prov.id, districtId: dist.id, categoryId: cat.id, page }),
    getProvinceFacets(prov.id),
  ]);

  const isEmpty = total === 0;

  await trackPage('hizmet', `${dist.name} ${cat.name}`, `${prov.slug}/${dist.slug}/${cat.slug}`);

  const seo = catSeo(cat.slug, cat.name);
  const catLower = trLower(cat.name);
  const pluralLower = trLower(seo.plural);
  const path = `/${prov.slug}/${dist.slug}/${cat.slug}`;
  const pageUrl = `${SITE}${path}`;

  // Veriye dayalı, sayfaya özgü giriş metni
  const catInProv = (facets.byCategory[cat.slug] || []);
  const provCatTotal = catInProv.reduce((s, f) => s + f.count, 0);
  const otherDistricts = catInProv.filter((f) => f.slug !== dist.slug);
  const otherCatsHere = (facets.byDistrict[dist.slug] || []).filter((f) => f.slug !== cat.slug);
  const names = items.slice(0, 3).map((b) => b.name);

  const paragraphs: string[] = [];
  if (!isEmpty) {
    paragraphs.push(
      `${dist.name} (${prov.name}) bölgesinde ${siteConfig.brandName}'de listelenen ${total} ${catLower} işletmesi bulunuyor${names.length ? `; aralarında ${joinTr(names)} yer alıyor` : ''}. İşletme sayfalarında adres, harita konumu ve işletmenin paylaştığı iletişim bilgileri yer alır.`
    );
  } else {
    paragraphs.push(`${dist.name} (${prov.name}) bölgesinde henüz listelenmiş bir ${catLower} işletmesi yok. Aşağıdaki yakın ilçelere ve ${prov.name} genelindeki işletmelere göz atabilirsiniz.`);
  }
  if (provCatTotal > 0) {
    paragraphs.push(
      `${prov.name} genelinde bu kategoride ${catInProv.length} ilçede toplam ${provCatTotal} işletme listeleniyor` +
        (otherDistricts.length
          ? `; ${dist.name} dışında en çok seçenek ${joinTr(otherDistricts.slice(0, 3).map((f) => `${f.name} (${f.count})`))} ilçelerinde.`
          : '.')
    );
  }
  paragraphs.push(seo.tips);
  if (otherCatsHere.length) {
    paragraphs.push(`${dist.name} bölgesinde ayrıca ${joinTr(otherCatsHere.slice(0, 3).map((f) => trLower(f.name)))} kategorilerinde de işletmeler bulunuyor.`);
  }

  const faqs = fillFaqs(seo.faqs, dist.name);
  const posts = relatedPosts({ il: prov.slug, ilce: dist.slug, catSlug: cat.slug, catName: cat.name });
  const provCatSlugs = new Set(Object.keys(facets.byCategory));

  const linkGroups = [
    {
      title: `${prov.name} içindeki diğer ilçelerde ${pluralLower}`,
      links: otherDistricts.slice(0, 10).map((f) => ({ href: `/${prov.slug}/${f.slug}/${cat.slug}`, label: `${f.name} ${seo.plural} (${f.count})` })),
    },
    {
      title: `${dist.name} bölgesindeki diğer hizmetler`,
      links: otherCatsHere.slice(0, 10).map((f) => ({ href: `/${prov.slug}/${dist.slug}/${f.slug}`, label: `${dist.name} ${catSeo(f.slug, f.name).plural}` })),
    },
    {
      title: 'İlgili sayfalar',
      links: [
        { href: `/${prov.slug}/${dist.slug}`, label: `${dist.name} güzellik ve bakım işletmeleri` },
        ...(provCatTotal > 0 ? [{ href: `/kategori/${cat.slug}?il=${prov.slug}`, label: `${prov.name} ${seo.plural}` }] : []),
        ...seo.related
          .filter((s) => provCatSlugs.has(s))
          .map((s) => {
            const f = facets.categories.find((c) => c.slug === s)!;
            return { href: `/kategori/${s}?il=${prov.slug}`, label: `${prov.name} ${catSeo(s, f.name).plural}` };
          }),
        { href: `/kategori/${cat.slug}`, label: `Türkiye geneli ${pluralLower}` },
        { href: `/${prov.slug}`, label: `${prov.name} güzellik merkezleri ve kuaförleri` },
      ],
    },
    { title: 'Rehber yazıları', links: posts.map((p) => ({ href: `/rehber/${p.slug}`, label: p.title })) },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema([
        { name: 'Ana Sayfa', path: '/' },
        { name: prov.name, path: `/${prov.slug}` },
        { name: dist.name, path: `/${prov.slug}/${dist.slug}` },
        { name: `${dist.name} ${cat.name}`, path },
      ]),
      {
        '@type': 'CollectionPage',
        '@id': pageUrl,
        name: `${dist.name} ${seo.plural} - ${prov.name}`,
        url: pageUrl,
        inLanguage: 'tr-TR',
        isPartOf: { '@id': `${SITE}/#website` },
        about: {
          '@type': 'Service',
          name: cat.name,
          serviceType: cat.name,
          areaServed: { '@type': 'AdministrativeArea', name: `${dist.name}, ${prov.name}` },
        },
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
        title={`${dist.name} ${seo.plural}`}
        subtitle={`${dist.name}, ${prov.name}`}
        items={items}
        total={total}
        perPage={perPage}
        page={page}
        basePath={path}
      />

      {isEmpty && (
        <section style={{ maxWidth: 700, margin: '0 auto', padding: '30px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: '#0e2148', fontWeight: 700, marginBottom: 10 }}>
            {dist.name} bölgesinde henüz {catLower} işletmesi eklenmemiş
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

      <SeoBlock
        heading={`${dist.name} ${seo.plural} - ${prov.name}`}
        paragraphs={paragraphs}
        faqTitle={`${dist.name} ${catLower} hakkında sık sorulanlar`}
        faqs={isEmpty ? [] : faqs}
        linkGroups={linkGroups}
      />

      <Footer />
    </>
  );
}
