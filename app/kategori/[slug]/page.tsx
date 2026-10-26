import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingView from '@/components/ListingView';
import CategoryFilter from '@/components/CategoryFilter';
import SeoBlock from '@/components/SeoBlock';
import {
  getCategoryBySlug,
  getProvinceBySlug,
  getDistrictBySlug,
  getBusinessList,
} from '@/lib/queries-list';
import { getProvinces } from '@/lib/queries';
import { getCategoryFacets, getProvinceFacets } from '@/lib/queries-seo';
import { supabase } from '@/lib/supabase';
import { siteConfig } from '@/lib/siteConfig';
import { trackPage } from '@/lib/track-server';
import {
  SITE, OG_IMAGES, abs, ldJson, fitTitle, clampDesc, joinTr, trLower, catSeo, fillFaqs,
  faqSchema, itemListSchema, breadcrumbSchema, relatedPosts,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

type SP = { sayfa?: string; il?: string; ilce?: string };

async function resolveLoc(sp: SP) {
  let province: { id: number; name: string; slug: string } | null = null;
  let district: { id: number; name: string; slug: string; province_id: number } | null = null;
  if (sp.il) {
    province = await getProvinceBySlug(sp.il);
    if (province && sp.ilce) district = await getDistrictBySlug(province.id, sp.ilce);
  }
  return { province, district };
}

export async function generateMetadata({ params, searchParams }: { params: { slug: string }; searchParams: SP }) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) return { title: 'Kategori bulunamadı', robots: { index: false } };
  const { province, district } = await resolveLoc(searchParams);
  const seo = catSeo(cat.slug, cat.name);
  const catLower = trLower(cat.name);
  const page = Number(searchParams.sayfa) || 1;
  const pq = page > 1 ? `sayfa=${page}` : '';

  const { total } = await getBusinessList({ categoryId: cat.id, provinceId: province?.id, districtId: district?.id, page: 1 });

  let title: string | { absolute: string };
  let description: string;
  let canonical: string;

  if (province && district) {
    // il+ilçe filtresi = /il/ilce/hizmet sayfasının kopyası → oraya kanonik
    title = fitTitle([`${district.name} ${seo.plural} - ${province.name}`, `${district.name} ${seo.plural}`]);
    description = clampDesc(`${district.name} ${catLower}: ${province.name} ${district.name} bölgesindeki ${total} ${catLower} işletmesinin adresi, telefonu ve konumu.`);
    canonical = abs(`/${province.slug}/${district.slug}/${cat.slug}`);
  } else if (province) {
    title = fitTitle([`${province.name} ${seo.plural}`, `${province.name} ${cat.name}`]);
    description = clampDesc(
      total > 0
        ? `${province.name} ${catLower}: ${total} ${catLower} işletmesinin ilçe ilçe adresi, telefonu ve konumu. Seçerken nelere dikkat etmeli, sık sorulan sorular.`
        : `${province.name} ${catLower} işletmeleri. Bu ilde henüz kayıtlı ${catLower} işletmesi yok; Türkiye genelindeki adreslere göz atın.`
    );
    canonical = abs(`/kategori/${cat.slug}?il=${province.slug}${pq ? `&${pq}` : ''}`);
  } else {
    title = fitTitle([`${seo.plural}: İl İl Adresler`, seo.plural]);
    description = clampDesc(
      `${seo.plural} Türkiye genelinde: ${total} ${catLower} işletmesinin il ve ilçeye göre adresi, telefonu ve konumu. Seçerken dikkat edilecekler ve SSS.`
    );
    canonical = abs(`/kategori/${cat.slug}${pq ? `?${pq}` : ''}`);
  }
  const ogTitle = typeof title === 'string' ? title : title.absolute;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: ogTitle, description, url: canonical, type: 'website', siteName: siteConfig.brandName, locale: 'tr_TR', images: OG_IMAGES },
    ...(total === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SP;
}) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) notFound();

  // Sayfa takibi (sadece filtresiz ana kategori görüntülemesi)
  if (!searchParams.il) await trackPage('kategori', cat.name, cat.slug);

  const page = Number(searchParams.sayfa) || 1;
  const [provinces, { province, district }, catFacets] = await Promise.all([
    getProvinces(),
    resolveLoc(searchParams),
    getCategoryFacets(cat.id),
  ]);

  let initialDistricts: any[] = [];
  if (province) {
    const { data } = await supabase
      .from('districts')
      .select('id, name, slug, province_id')
      .eq('province_id', province.id)
      .order('name');
    initialDistricts = data || [];
  }

  const [{ items, total, perPage }, provFacets] = await Promise.all([
    getBusinessList({ categoryId: cat.id, provinceId: province?.id, districtId: district?.id, page }),
    province ? getProvinceFacets(province.id) : Promise.resolve(null),
  ]);

  // başlık ve alt başlık
  let locLabel = 'Türkiye geneli';
  if (district) locLabel = `${district.name}, ${province!.name}`;
  else if (province) locLabel = province.name;

  // pagination basePath (filtre parametrelerini koru)
  const basePath = `/kategori/${cat.slug}`;
  const qp: string[] = [];
  if (province) qp.push(`il=${province.slug}`);
  if (district) qp.push(`ilce=${district.slug}`);
  const baseWithFilter = qp.length ? `${basePath}?${qp.join('&')}` : basePath;

  // ---- SEO içerik ----
  const seo = catSeo(cat.slug, cat.name);
  const catLower = trLower(cat.name);
  const pluralLower = trLower(seo.plural);
  const isEmpty = total === 0;
  const locName = district ? district.name : province ? province.name : 'Türkiye genelinde';
  const pageUrl = province ? `${SITE}${basePath}?il=${province.slug}` : `${SITE}${basePath}`;

  const paragraphs: string[] = [];
  const linkGroups: { title: string; links: { href: string; label: string }[] }[] = [];

  if (province && !district) {
    const dists = catFacets.byProvince[province.slug] || [];
    if (!isEmpty) {
      paragraphs.push(
        `${province.name} genelinde ${siteConfig.brandName}'de ${total} ${catLower} işletmesi listeleniyor` +
          (dists.length ? `; işletmeler ${dists.length} ilçeye dağılıyor ve en çok seçenek ${joinTr(dists.slice(0, 3).map((d) => `${d.name} (${d.count})`))} ilçelerinde.` : '.')
      );
    } else {
      paragraphs.push(`${province.name} içinde henüz listelenmiş bir ${catLower} işletmesi yok. Diğer illerdeki ${pluralLower} için aşağıdaki bağlantılara göz atabilirsiniz.`);
    }
    paragraphs.push(seo.tips);
    linkGroups.push({
      title: `${province.name} ilçelerinde ${pluralLower}`,
      links: dists.map((d) => ({ href: `/${province.slug}/${d.slug}/${cat.slug}`, label: `${d.name} ${seo.plural} (${d.count})` })),
    });
    const provCats = new Map((provFacets?.categories || []).map((c) => [c.slug, c]));
    linkGroups.push({
      title: `${province.name} içinde ilgili hizmetler`,
      links: seo.related.filter((s) => provCats.has(s)).map((s) => ({ href: `/kategori/${s}?il=${province.slug}`, label: `${province.name} ${catSeo(s, provCats.get(s)!.name).plural}` })),
    });
    linkGroups.push({
      title: 'Genel',
      links: [
        { href: `/kategori/${cat.slug}`, label: `Türkiye geneli ${pluralLower}` },
        { href: `/${province.slug}`, label: `${province.name} güzellik merkezleri ve kuaförleri` },
      ],
    });
  } else if (!province) {
    if (!isEmpty) {
      paragraphs.push(
        `Türkiye genelinde ${siteConfig.brandName}'de ${total} ${catLower} işletmesi listeleniyor` +
          (catFacets.provinces.length ? `; işletmeler ${catFacets.provinces.length} ile dağılıyor ve en çok seçenek ${joinTr(catFacets.provinces.slice(0, 3).map((p) => `${p.name} (${p.count})`))} illerinde.` : '.') +
          ' Yukarıdan il ve ilçe seçerek size en yakın işletmeleri listeleyebilirsiniz.'
      );
    }
    paragraphs.push(seo.tips);
    linkGroups.push({
      title: `İllere göre ${pluralLower}`,
      links: catFacets.provinces.slice(0, 30).map((p) => ({ href: `/kategori/${cat.slug}?il=${p.slug}`, label: `${p.name} ${seo.plural} (${p.count})` })),
    });
    linkGroups.push({
      title: 'İlgili kategoriler',
      links: seo.related.map((s) => ({ href: `/kategori/${s}`, label: catSeo(s, s).plural })),
    });
  } else {
    // il + ilçe filtresi (kanonik: /il/ilce/hizmet)
    paragraphs.push(seo.tips);
    linkGroups.push({
      title: 'İlgili sayfalar',
      links: [
        { href: `/${province.slug}/${district!.slug}/${cat.slug}`, label: `${district!.name} ${seo.plural}` },
        { href: `/kategori/${cat.slug}?il=${province.slug}`, label: `${province.name} ${seo.plural}` },
      ],
    });
  }

  const posts = relatedPosts({ il: province?.slug, ilce: district?.slug, catSlug: cat.slug, catName: cat.name });
  linkGroups.push({ title: 'Rehber yazıları', links: posts.map((p) => ({ href: `/rehber/${p.slug}`, label: p.title })) });

  const faqs = fillFaqs(seo.faqs, locName);
  const showFaq = !isEmpty && !district;

  const crumbs = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Kategoriler', path: '/kategoriler' },
    { name: seo.plural, path: basePath },
    ...(province ? [{ name: `${province.name} ${seo.plural}`, path: `${basePath}?il=${province.slug}` }] : []),
  ];
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(crumbs),
      {
        '@type': 'CollectionPage',
        '@id': pageUrl,
        name: province ? `${province.name} ${seo.plural}` : seo.plural,
        url: pageUrl,
        inLanguage: 'tr-TR',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@type': 'Service', name: cat.name, serviceType: cat.name },
        ...(items.length ? { mainEntity: itemListSchema(items, total) } : {}),
      },
      ...(showFaq ? [faqSchema(faqs)] : []),
    ],
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(schema) }} />
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
        title={`${cat.emoji || ''} ${province ? `${district ? district.name : province.name} ${seo.plural}` : seo.plural}`}
        subtitle={locLabel}
        items={items}
        total={total}
        perPage={perPage}
        page={page}
        basePath={baseWithFilter}
      />
      <SeoBlock
        heading={province ? `${district ? district.name : province.name} ${seo.plural}` : `${seo.plural}: Seçerken Dikkat Edilecekler`}
        paragraphs={paragraphs}
        faqs={showFaq ? faqs : []}
        linkGroups={linkGroups}
      />
      <Footer />
    </>
  );
}
