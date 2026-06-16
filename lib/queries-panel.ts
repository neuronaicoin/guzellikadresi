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
  province_id: number | null;
  district_id: number | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  serviceIds: number[];
};

// Düzenleme için tek işletme (sahiplik kontrolü çağıran tarafta yapılır)
export async function getMyBusinessDetail(id: string): Promise<EditableBusiness | null> {
  const { data, error } = await supabaseAuth
    .from('businesses')
    .select(`
      id, owner_id, name, description,
      phone, whatsapp, website, instagram, facebook, x_twitter, linkedin,
      province_id, district_id, address, lat, lng,
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
    province_id: b.province_id,
    district_id: b.district_id,
    address: b.address,
    lat: b.lat,
    lng: b.lng,
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
  province_id: number | null;
  district_id: number | null;
  address: string;
  lat: number | null;
  lng: number | null;
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
      province_id: fields.province_id,
      district_id: fields.district_id,
      address: fields.address || null,
      lat: fields.lat,
      lng: fields.lng,
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

// İşletme istatistikleri (son 30 gün + toplam). Sadece owner okuyabilir (RLS).
export type BizStats = {
  views30: number;
  phone30: number;
  whatsapp30: number;
  social30: number;
  viewsTotal: number;
  phoneTotal: number;
  whatsappTotal: number;
  reachTotal: number;
};

export async function getBusinessStats(businessId: string): Promise<BizStats> {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const empty: BizStats = { views30: 0, phone30: 0, whatsapp30: 0, social30: 0, viewsTotal: 0, phoneTotal: 0, whatsappTotal: 0, reachTotal: 0 };

  try {
    const { data: recent } = await supabaseAuth
      .from('business_events')
      .select('type')
      .eq('business_id', businessId)
      .gte('created_at', sinceIso);

    // Tüm zaman: type bazında say
    const { data: allEv } = await supabaseAuth
      .from('business_events')
      .select('type')
      .eq('business_id', businessId);

    const stats = { ...empty };
    (allEv || []).forEach((e: any) => {
      if (e.type === 'view') stats.viewsTotal++;
      else if (e.type === 'phone_click') stats.phoneTotal++;
      else if (e.type === 'whatsapp_click') stats.whatsappTotal++;
    });
    stats.reachTotal = stats.phoneTotal + stats.whatsappTotal;

    (recent || []).forEach((e: any) => {
      if (e.type === 'view') stats.views30++;
      else if (e.type === 'phone_click') stats.phone30++;
      else if (e.type === 'whatsapp_click') stats.whatsapp30++;
      else if (e.type === 'website_click' || e.type === 'instagram_click' || e.type === 'facebook_click' || e.type === 'x_click' || e.type === 'linkedin_click') stats.social30++;
    });
    return stats;
  } catch {
    return empty;
  }
}

// ---- FOTOĞRAF YÖNETİMİ ----
export type BizPhoto = { id: number; url: string; kind: string; is_cover: boolean; sort_order: number };

export async function getBusinessPhotos(businessId: string): Promise<BizPhoto[]> {
  const { data } = await supabaseAuth
    .from('business_photos')
    .select('id, url, kind, is_cover, sort_order')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true });
  return (data || []) as BizPhoto[];
}

// Storage'a yükle + business_photos'a satır ekle
export async function addBusinessPhoto(
  businessId: string,
  blob: Blob,
  kind: 'gallery' | 'work'
): Promise<{ ok: boolean; error?: string }> {
  try {
    const fileName = `${businessId}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const { error: upErr } = await supabaseAuth.storage
      .from('business-photos')
      .upload(fileName, blob, { contentType: 'image/webp', upsert: false });
    if (upErr) return { ok: false, error: upErr.message };

    const { data: pub } = supabaseAuth.storage.from('business-photos').getPublicUrl(fileName);
    const url = pub.publicUrl;

    const { error: insErr } = await supabaseAuth
      .from('business_photos')
      .insert({ business_id: businessId, url, kind, is_cover: false, sort_order: 99 });
    if (insErr) return { ok: false, error: insErr.message };

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Yükleme hatası' };
  }
}

export async function deleteBusinessPhoto(photoId: number): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAuth.from('business_photos').delete().eq('id', photoId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
