import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { supabase } from '@/lib/supabase';
import { getAllPosts } from '@/lib/data/blog';

export const revalidate = 86400; // günde 1 yenile

type Row = {
  slug: string;
  updated_at: string | null;
  created_at: string | null;
  provinces: { slug: string } | null;
  districts: { slug: string } | null;
  categories: { slug: string } | null;
};

// Supabase satır limiti (1000) yüzünden sayfa sayfa çek
async function fetchApprovedBusinesses(): Promise<Row[]> {
  const out: Row[] = [];
  const size = 1000;
  for (let from = 0; from < 50000; from += size) {
    const { data, error } = await supabase
      .from('businesses')
      .select('slug, updated_at, created_at, provinces(slug), districts(slug), categories(slug)')
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .range(from, from + size - 1);
    if (error || !data) break;
    out.push(...(data as any[]));
    if (data.length < size) break;
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url || 'https://guzellikadresin.com';

  let biz: Row[] = [];
  try {
    biz = await fetchApprovedBusinesses();
  } catch {}

  const dateOf = (b: Row) => new Date(b.updated_at || b.created_at || 0);
  const latest = (rows: Row[]) =>
    rows.reduce<Date | undefined>((m, b) => {
      const d = dateOf(b);
      return !isNaN(d.getTime()) && d.getTime() > 0 && (!m || d > m) ? d : m;
    }, undefined);

  // Bir anahtara göre grupla → her grubun en son güncellenme tarihi
  const group = (keyFn: (b: Row) => string | null) => {
    const m = new Map<string, Row[]>();
    for (const b of biz) {
      const k = keyFn(b);
      if (k) m.set(k, [...(m.get(k) || []), b]);
    }
    return m;
  };
  const entries = (m: Map<string, Row[]>, toPath: (k: string) => string, priority: number): MetadataRoute.Sitemap =>
    Array.from(m.entries()).map(([k, rows]) => ({
      url: `${base}${toPath(k)}`,
      lastModified: latest(rows),
      changeFrequency: 'weekly',
      priority,
    }));

  const il = (b: Row) => b.provinces?.slug || null;
  const ilce = (b: Row) => (b.provinces?.slug && b.districts?.slug ? `${b.provinces.slug}/${b.districts.slug}` : null);
  const kat = (b: Row) => b.categories?.slug || null;

  // Sadece işletmesi olan (indekslenebilir) sayfalar; boş olanlar noindex
  const provinceEntries = entries(group(il), (k) => `/${k}`, 0.7);
  const districtEntries = entries(group(ilce), (k) => `/${k}`, 0.7);
  const comboEntries = entries(
    group((b) => (ilce(b) && kat(b) ? `${ilce(b)}/${kat(b)}` : null)),
    (k) => `/${k}`,
    0.8
  );
  const categoryEntries = entries(group(kat), (k) => `/kategori/${k}`, 0.8);
  const categoryProvinceEntries = entries(
    group((b) => (kat(b) && il(b) ? `${kat(b)}?il=${il(b)}` : null)),
    (k) => `/kategori/${k}`,
    0.7
  );

  const businessEntries: MetadataRoute.Sitemap = biz.map((b) => ({
    url: `${base}/isletme/${b.slug}`,
    lastModified: dateOf(b).getTime() > 0 ? dateOf(b) : undefined,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Bloglar
  // Aynı slug iki yazıda varsa tek URL yaz
  const posts = getAllPosts().filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i);
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/rehber/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
  const latestPost = posts[0]?.publishedAt ? new Date(posts[0].publishedAt) : undefined;
  const latestBiz = latest(biz);

  // Statik sayfalar (/ara noindex olduğu için yok)
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: latestBiz, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/kategoriler`, lastModified: latestBiz, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/sehirler`, lastModified: latestBiz, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/rehber`, lastModified: latestPost, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/isletme-ekle`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/hakkimizda`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/iletisim`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/kvkk`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/gizlilik`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/kullanim-sartlari`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  return [
    ...staticEntries,
    ...categoryEntries,
    ...provinceEntries,
    ...districtEntries,
    ...comboEntries,
    ...categoryProvinceEntries,
    ...businessEntries,
    ...blogEntries,
  ];
}
