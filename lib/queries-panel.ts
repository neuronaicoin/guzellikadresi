import { supabaseAuth } from '@/lib/supabase-auth';

export type MyBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  category_name: string | null;
  province_name: string | null;
  district_name: string | null;
  cover_url: string | null;
  created_at: string;
};

export async function getMyBusinesses(ownerId: string): Promise<MyBusiness[]> {
  const { data, error } = await supabaseAuth
    .from('businesses')
    .select(`
      id, name, slug, status, created_at,
      categories(name),
      provinces(name),
      districts(name),
      business_photos(url, is_cover)
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((b: any) => {
    const cover = (b.business_photos || []).find((p: any) => p.is_cover) || (b.business_photos || [])[0];
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      status: b.status,
      category_name: b.categories?.name ?? null,
      province_name: b.provinces?.name ?? null,
      district_name: b.districts?.name ?? null,
      cover_url: cover?.url ?? null,
      created_at: b.created_at,
    };
  });
}
