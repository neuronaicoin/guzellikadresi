import { supabase } from '@/lib/supabase';
import type { Category, Province, BusinessCard } from '@/lib/types';

export async function getCategoriesWithCounts(): Promise<Category[]> {
  const { data: cats } = await supabase
    .from('categories')
    .select('id, name, slug, emoji, services(id, name, slug, sort_order)')
    .eq('is_active', true)
    .order('sort_order');

  if (!cats) return [];

  const { data: counts } = await supabase
    .from('businesses')
    .select('category_id')
    .eq('status', 'approved');

  const countMap = new Map<number, number>();
  (counts || []).forEach((row: any) => {
    countMap.set(row.category_id, (countMap.get(row.category_id) || 0) + 1);
  });

  return cats.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    emoji: c.emoji,
    business_count: countMap.get(c.id) || 0,
    services: (c.services || [])
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((s: any) => ({ id: s.id, name: s.name, slug: s.slug })),
  }));
}

export async function getProvinces(): Promise<Province[]> {
  const { data } = await supabase
    .from('provinces')
    .select('id, name, slug')
    .order('name');
  return data || [];
}

async function fetchBusinessCards(filter: 'recent' | 'featured'): Promise<BusinessCard[]> {
  let query = supabase
    .from('businesses')
    .select(`
      id, name, slug, created_at,
      categories(name),
      provinces(name),
      districts(name),
      business_photos(url, is_cover),
      business_services(services(name))
    `)
    .eq('status', 'approved');

  if (filter === 'featured') {
    query = query.eq('is_featured', true).limit(6);
  } else {
    query = query.order('created_at', { ascending: false }).limit(6);
  }

  const { data } = await query;
  if (!data) return [];

  return data.map((b: any) => {
    const cover = (b.business_photos || []).find((p: any) => p.is_cover) || (b.business_photos || [])[0];
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      created_at: b.created_at,
      category_name: b.categories?.name ?? null,
      province_name: b.provinces?.name ?? null,
      district_name: b.districts?.name ?? null,
      cover_url: cover?.url ?? null,
      services: (b.business_services || []).map((bs: any) => bs.services?.name).filter(Boolean),
    };
  });
}

export const getRecentBusinesses = () => fetchBusinessCards('recent');
export const getFeaturedBusinesses = () => fetchBusinessCards('featured');

export async function getTotalBusinessCount(): Promise<number> {
  const { count } = await supabase
    .from('businesses')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved');
  return count || 0;
}
