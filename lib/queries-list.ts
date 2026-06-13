import { supabase } from '@/lib/supabase';
import type { BusinessCard } from '@/lib/types';

const PER_PAGE = 12;

type ListFilters = {
  provinceId?: number;
  districtId?: number;
  categoryId?: number;
  page?: number;
};

// İl slug -> {id, name}
export async function getProvinceBySlug(slug: string) {
  const { data } = await supabase.from('provinces').select('id, name, slug').eq('slug', slug).single();
  return data || null;
}

// İlçe slug (il içinde) -> {id, name}
export async function getDistrictBySlug(provinceId: number, slug: string) {
  const { data } = await supabase
    .from('districts')
    .select('id, name, slug, province_id')
    .eq('province_id', provinceId)
    .eq('slug', slug)
    .single();
  return data || null;
}

// Kategori slug -> {id, name, emoji}
export async function getCategoryBySlug(slug: string) {
  const { data } = await supabase.from('categories').select('id, name, slug, emoji').eq('slug', slug).single();
  return data || null;
}

// Filtrelere göre işletmeleri getir + toplam sayı
export async function getBusinessList(filters: ListFilters): Promise<{ items: BusinessCard[]; total: number; perPage: number }> {
  const page = Math.max(1, filters.page || 1);
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  let q = supabase
    .from('businesses')
    .select(`
      id, name, slug, created_at,
      categories(name),
      provinces(name),
      districts(name),
      business_photos(url, is_cover),
      business_services(services(name))
    `, { count: 'exact' })
    .eq('status', 'approved');

  if (filters.provinceId) q = q.eq('province_id', filters.provinceId);
  if (filters.districtId) q = q.eq('district_id', filters.districtId);
  if (filters.categoryId) q = q.eq('category_id', filters.categoryId);

  q = q.order('created_at', { ascending: false }).range(from, to);

  const { data, count } = await q;

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

  return { items, total: count || 0, perPage: PER_PAGE };
}
