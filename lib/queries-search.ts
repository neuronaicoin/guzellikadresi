import { supabase } from '@/lib/supabase';
import type { BusinessCard } from '@/lib/types';

// İşletme adı, açıklama, HİZMET, KATEGORİ ve KONUM (il/ilçe) üzerinde arama
// Opsiyonel: provinceId / districtId ile sonuçları belirli il/ilçeye daraltır
export async function searchBusinesses(term: string, opts?: { provinceId?: number; districtId?: number }): Promise<BusinessCard[]> {
  const q = term.trim();
  if (!q) return [];
  const like = `%${q}%`;

  // Eşleşen işletme id'lerini topla (birden çok kaynaktan)
  const ids = new Set<string>();

  // 1) İşletme adı / açıklama
  try {
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('status', 'approved')
      .or(`name.ilike.${like},description.ilike.${like},address.ilike.${like}`)
      .limit(60);
    (data || []).forEach((r: any) => ids.add(r.id));
  } catch {}

  // 2) Hizmet adına göre (services -> business_services -> businesses)
  try {
    const { data: svc } = await supabase.from('services').select('id').ilike('name', like).limit(40);
    const svcIds = (svc || []).map((s: any) => s.id);
    if (svcIds.length) {
      const { data: bs } = await supabase.from('business_services').select('business_id').in('service_id', svcIds).limit(200);
      (bs || []).forEach((r: any) => ids.add(r.business_id));
    }
  } catch {}

  // 3) Kategori adına göre
  try {
    const { data: cat } = await supabase.from('categories').select('id').ilike('name', like).limit(20);
    const catIds = (cat || []).map((c: any) => c.id);
    if (catIds.length) {
      const { data: bizByCat } = await supabase.from('businesses').select('id').eq('status', 'approved').in('category_id', catIds).limit(60);
      (bizByCat || []).forEach((r: any) => ids.add(r.id));
    }
  } catch {}

  // 4) Konum: il veya ilçe adına göre
  try {
    const { data: prov } = await supabase.from('provinces').select('id').ilike('name', like).limit(10);
    const provIds = (prov || []).map((p: any) => p.id);
    if (provIds.length) {
      const { data: bizByProv } = await supabase.from('businesses').select('id').eq('status', 'approved').in('province_id', provIds).limit(60);
      (bizByProv || []).forEach((r: any) => ids.add(r.id));
    }
    const { data: dist } = await supabase.from('districts').select('id').ilike('name', like).limit(20);
    const distIds = (dist || []).map((d: any) => d.id);
    if (distIds.length) {
      const { data: bizByDist } = await supabase.from('businesses').select('id').eq('status', 'approved').in('district_id', distIds).limit(60);
      (bizByDist || []).forEach((r: any) => ids.add(r.id));
    }
  } catch {}

  if (ids.size === 0) return [];

  // Eşleşen işletmelerin detaylarını çek
  let detailQuery = supabase
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
    .in('id', Array.from(ids));

  // İl/ilçe filtresi (varsa)
  if (opts?.provinceId) detailQuery = detailQuery.eq('province_id', opts.provinceId);
  if (opts?.districtId) detailQuery = detailQuery.eq('district_id', opts.districtId);

  const { data } = await detailQuery
    .order('created_at', { ascending: false })
    .limit(60);

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
