import { supabaseAuth } from '@/lib/supabase-auth';

// ============================================================
//  RANDEVU SİSTEMİ — QUERY KATMANI
//  Desen: queries-panel.ts ile aynı (supabaseAuth, RLS owner_id).
// ============================================================

// ---- Randevu ayarları (businesses üzerindeki alanlar) ----
export type AppointmentSettings = {
  staff_count: number;
  show_price: boolean;
  randevu_aktif: boolean;
};

export async function getAppointmentSettings(
  businessId: string
): Promise<AppointmentSettings | null> {
  const { data, error } = await supabaseAuth
    .from('businesses')
    .select('staff_count, show_price, randevu_aktif')
    .eq('id', businessId)
    .single();
  if (error || !data) return null;
  return {
    staff_count: data.staff_count ?? 1,
    show_price: data.show_price ?? false,
    randevu_aktif: data.randevu_aktif ?? false,
  };
}

export async function updateAppointmentSettings(
  businessId: string,
  fields: { staff_count: number; show_price: boolean; randevu_aktif: boolean }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAuth
    .from('businesses')
    .update({
      staff_count: fields.staff_count,
      show_price: fields.show_price,
      randevu_aktif: fields.randevu_aktif,
    })
    .eq('id', businessId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---- Hizmetler (appointment_services tablosu) ----
export type AppointmentService = {
  id: string;
  name: string;
  duration_min: number;
  price: number | null;
  sort_order: number;
};

export async function getAppointmentServices(
  businessId: string
): Promise<AppointmentService[]> {
  const { data } = await supabaseAuth
    .from('appointment_services')
    .select('id, name, duration_min, price, sort_order')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true });
  return (data || []) as AppointmentService[];
}

// Tüm hizmetleri topluca kaydet: mevcut olanları güncelle, yenileri ekle, silinenleri sil.
// Basit ve güvenli yol: önce hepsini sil, sonra yeniden ekle (transaction gibi davranır).
export async function saveAppointmentServices(
  businessId: string,
  services: { name: string; duration_min: number; price: number | null }[]
): Promise<{ ok: boolean; error?: string }> {
  // 1) Mevcut hizmetleri sil
  const { error: delErr } = await supabaseAuth
    .from('appointment_services')
    .delete()
    .eq('business_id', businessId);
  if (delErr) return { ok: false, error: delErr.message };

  // 2) Yeni listeyi ekle (boş değilse)
  if (services.length > 0) {
    const rows = services.map((s, i) => ({
      business_id: businessId,
      name: s.name.trim(),
      duration_min: s.duration_min,
      price: s.price,
      sort_order: i,
    }));
    const { error: insErr } = await supabaseAuth
      .from('appointment_services')
      .insert(rows);
    if (insErr) return { ok: false, error: insErr.message };
  }
  return { ok: true };
}

// ---- İşletmenin kategori slug'ını çek (otomatik şablon için) ----
export async function getBusinessCategorySlug(
  businessId: string
): Promise<string | null> {
  const { data, error } = await supabaseAuth
    .from('businesses')
    .select('categories(slug)')
    .eq('id', businessId)
    .single();
  if (error || !data) return null;
  const cat: any = (data as any).categories;
  return cat?.slug ?? null;
}
