import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { supabase } from '@/lib/supabase';
import { getAllPosts } from '@/lib/data/blog';

export const revalidate = 86400; // günde 1 yenile

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url || 'https://guzellikadresin.com';
  const now = new Date();

  // Statik sayfalar
  const staticPaths = [
    '',
    '/ara',
    '/kategoriler',
    '/sehirler',
    '/rehber',
    '/isletme-ekle',
    '/hakkimizda',
    '/iletisim',
    '/kvkk',
    '/gizlilik',
    '/kullanim-sartlari',
  ];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === '' ? 'daily' : 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));

  // Bloglar
  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/rehber/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Kategoriler
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const { data: cats } = await supabase.from('categories').select('slug');
    categoryEntries = (cats || []).map((c) => ({
      url: `${base}/kategori/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {}

  // İller
  let provinceEntries: MetadataRoute.Sitemap = [];
  try {
    const { data: provs } = await supabase.from('provinces').select('slug');
    provinceEntries = (provs || []).map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch {}

  // İşletmeler (yayında olanlar)
  let businessEntries: MetadataRoute.Sitemap = [];
  // Programatik: dolu il/ilçe/hizmet kombinasyonları
  let comboEntries: MetadataRoute.Sitemap = [];
  try {
    const { data: biz } = await supabase
      .from('businesses')
      .select('slug, updated_at, provinces(slug), districts(slug), categories(slug)')
      .eq('status', 'approved');

    businessEntries = (biz || []).map((b: any) => ({
      url: `${base}/isletme/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Benzersiz dolu kombinasyonları topla (il/ilçe/hizmet)
    const seen = new Set<string>();
    for (const b of biz || []) {
      const il = (b as any).provinces?.slug;
      const ilce = (b as any).districts?.slug;
      const hizmet = (b as any).categories?.slug;
      if (il && ilce && hizmet) {
        const key = `${il}/${ilce}/${hizmet}`;
        if (!seen.has(key)) {
          seen.add(key);
          comboEntries.push({
            url: `${base}/${key}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }
    }
  } catch {}

  return [
    ...staticEntries,
    ...categoryEntries,
    ...provinceEntries,
    ...comboEntries,
    ...businessEntries,
    ...blogEntries,
  ];
}
