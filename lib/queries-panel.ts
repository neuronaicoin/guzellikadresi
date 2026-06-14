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

export type EditableBusiness = {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  x_twitter: string | null;
  linkedin: string | null;
  serviceIds: number[];
};

// Düzenleme için tek işletme (sahiplik kontrolü çağıran tarafta yapılır)
export async function getMyBusinessDetail(id: string): Promise<EditableBusiness | null> {
  const { data, error } = await supabaseAuth
    .from('businesses')
    .select(`
      id, owner_id, name, description,
      phone, whatsapp, website, instagram, facebook, x_twitter, linkedin,
      business_services(service_id)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  const b: any = data;
  return {
    id: b.id,
    owner_id: b.owner_id,
    name: b.name,
    description: b.description,
    phone: b.phone,
    whatsapp: b.whatsapp,
    website: b.website,
    instagram: b.instagram,
    facebook: b.facebook,
    x_twitter: b.x_twitter,
    linkedin: b.linkedin,
    serviceIds: (b.business_services || []).map((s: any) => s.service_id),
  };
}

// İşletme bilgilerini güncelle (RLS: sadece owner). Hizmetler ayrı güncellenir.
export async function updateMyBusiness(id: string, fields: {
  name: string;
  description: string;
  phone: string;
  whatsapp: string;
  website: string;
  instagram: string;
  facebook: string;
  x_twitter: string;
  linkedin: string;
  serviceIds: number[];
}): Promise<{ ok: boolean; error?: string }> {
  // 1) Ana bilgiler
  const { error: upErr } = await supabaseAuth
    .from('businesses')
    .update({
      name: fields.name,
      description: fields.description,
      phone: fields.phone,
      whatsapp: fields.whatsapp || null,
      website: fields.website || null,
      instagram: fields.instagram || null,
      facebook: fields.facebook || null,
      x_twitter: fields.x_twitter || null,
      linkedin: fields.linkedin || null,
    })
    .eq('id', id);

  if (upErr) return { ok: false, error: upErr.message };

  // 2) Hizmetleri güncelle: önce sil, sonra ekle
  await supabaseAuth.from('business_services').delete().eq('business_id', id);
  if (fields.serviceIds.length > 0) {
    const rows = fields.serviceIds.map((sid) => ({ business_id: id, service_id: sid }));
    const { error: svcErr } = await supabaseAuth.from('business_services').insert(rows);
    if (svcErr) return { ok: false, error: svcErr.message };
  }

  return { ok: true };
}
