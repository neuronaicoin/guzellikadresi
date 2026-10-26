// SEO için hafif "facet" sorguları: bir il / kategori içindeki
// dolu ilçe ve kategori sayıları (iç linkler + benzersiz giriş metni)
import { supabase } from '@/lib/supabase';

export type Facet = { name: string; slug: string; count: number };

function tally(rows: any[], key: string): Facet[] {
  const m = new Map<string, Facet>();
  for (const r of rows) {
    const o = r[key];
    if (!o?.slug) continue;
    const f = m.get(o.slug) || { name: o.name, slug: o.slug, count: 0 };
    f.count++;
    m.set(o.slug, f);
  }
  return Array.from(m.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'tr'));
}

export type ProvinceFacets = {
  total: number;
  districts: Facet[];
  categories: Facet[];
  // ilçe slug -> o ilçedeki kategoriler
  byDistrict: Record<string, Facet[]>;
  // kategori slug -> o kategorinin ilçeleri
  byCategory: Record<string, Facet[]>;
};

export async function getProvinceFacets(provinceId: number): Promise<ProvinceFacets> {
  const empty: ProvinceFacets = { total: 0, districts: [], categories: [], byDistrict: {}, byCategory: {} };
  try {
    const { data } = await supabase
      .from('businesses')
      .select('districts(name, slug), categories(name, slug)')
      .eq('status', 'approved')
      .eq('province_id', provinceId)
      .limit(5000);
    const rows = (data || []) as any[];
    if (!rows.length) return empty;
    const byDistrict: Record<string, Facet[]> = {};
    const byCategory: Record<string, Facet[]> = {};
    const dGroups = new Map<string, any[]>();
    const cGroups = new Map<string, any[]>();
    for (const r of rows) {
      if (r.districts?.slug) dGroups.set(r.districts.slug, [...(dGroups.get(r.districts.slug) || []), r]);
      if (r.categories?.slug) cGroups.set(r.categories.slug, [...(cGroups.get(r.categories.slug) || []), r]);
    }
    dGroups.forEach((g, k) => (byDistrict[k] = tally(g, 'categories')));
    cGroups.forEach((g, k) => (byCategory[k] = tally(g, 'districts')));
    return { total: rows.length, districts: tally(rows, 'districts'), categories: tally(rows, 'categories'), byDistrict, byCategory };
  } catch {
    return empty;
  }
}

export type CategoryFacets = {
  total: number;
  provinces: Facet[];
  // il slug -> ilçeler
  byProvince: Record<string, Facet[]>;
};

export async function getCategoryFacets(categoryId: number): Promise<CategoryFacets> {
  const empty: CategoryFacets = { total: 0, provinces: [], byProvince: {} };
  try {
    const { data } = await supabase
      .from('businesses')
      .select('provinces(name, slug), districts(name, slug)')
      .eq('status', 'approved')
      .eq('category_id', categoryId)
      .limit(5000);
    const rows = (data || []) as any[];
    if (!rows.length) return empty;
    const groups = new Map<string, any[]>();
    for (const r of rows) if (r.provinces?.slug) groups.set(r.provinces.slug, [...(groups.get(r.provinces.slug) || []), r]);
    const byProvince: Record<string, Facet[]> = {};
    groups.forEach((g, k) => (byProvince[k] = tally(g, 'districts')));
    return { total: rows.length, provinces: tally(rows, 'provinces'), byProvince };
  } catch {
    return empty;
  }
}
