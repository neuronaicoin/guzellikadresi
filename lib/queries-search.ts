import { supabase } from '@/lib/supabase';
import type { BusinessCard } from '@/lib/types';

// İşletme adı / açıklama / hizmet adına göre arama
export async function searchBusinesses(term: string): Promise<BusinessCard[]> {
  if (!term.trim()) return [];

  // İşletme adı veya açıklamada ara
  const { data } = await supabase
    .from('businesses')
    .select(`
      id, name, slug, created_at,
      categories(name),
      provinces(name),
      districts(name),
      business_photos(url, is_cover),
      business_services(services(name))
    `)
    .eq('status', 'approved')
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    .limit(40);

  const items: BusinessCard[] = (data || []).map((b: any) => {
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

  return items;
}
