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
  try {
    const { data: biz } = await supabase
      .from('businesses')
      .select('slug, updated_at')
      .eq('status', 'approved');
    businessEntries = (biz || []).map((b) => ({
      url: `${base}/isletme/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch {}

  return [
    ...staticEntries,
    ...categoryEntries,
    ...provinceEntries,
    ...businessEntries,
    ...blogEntries,
  ];
}
