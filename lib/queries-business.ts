import { supabase } from '@/lib/supabase';

export type BusinessDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: { name: string; slug: string; emoji: string | null } | null;
  province: { name: string; slug: string } | null;
  district: { name: string; slug: string } | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  x_twitter: string | null;
  linkedin: string | null;
  created_at: string;
  services: string[];
  gallery: string[];
  works: string[];
  coverUrl: string | null;
  // Randevu sistemi alanları
  randevu_aktif: boolean;
  staff_count: number;
  show_price: boolean;
};

export async function getBusinessBySlug(slug: string): Promise<BusinessDetail | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      id, name, slug, description, address, lat, lng,
      phone, whatsapp, website, instagram, facebook, x_twitter, linkedin, created_at,
      randevu_aktif, staff_count, show_price,
      categories(name, slug, emoji),
      provinces(name, slug),
      districts(name, slug),
      business_photos(url, kind, is_cover, sort_order),
      business_services(services(name))
    `)
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();
  if (error || !data) return null;
  const b: any = data;
  const photos = (b.business_photos || []).sort((a: any, c: any) => (a.sort_order ?? 0) - (c.sort_order ?? 0));
  const gallery = photos.filter((p: any) => p.kind !== 'work').map((p: any) => p.url);
  const works = photos.filter((p: any) => p.kind === 'work').map((p: any) => p.url);
  const cover = photos.find((p: any) => p.is_cover) || photos[0];
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: b.description,
    category: b.categories ? { name: b.categories.name, slug: b.categories.slug, emoji: b.categories.emoji } : null,
    province: b.provinces ? { name: b.provinces.name, slug: b.provinces.slug } : null,
    district: b.districts ? { name: b.districts.name, slug: b.districts.slug } : null,
    address: b.address,
    lat: b.lat,
    lng: b.lng,
    phone: b.phone,
    whatsapp: b.whatsapp,
    website: b.website,
    instagram: b.instagram,
    facebook: b.facebook,
    x_twitter: b.x_twitter,
    linkedin: b.linkedin,
    created_at: b.created_at,
    services: (b.business_services || []).map((bs: any) => bs.services?.name).filter(Boolean),
    gallery,
    works,
    coverUrl: cover?.url ?? null,
    randevu_aktif: b.randevu_aktif ?? false,
    staff_count: b.staff_count ?? 1,
    show_price: b.show_price ?? false,
  };
}
