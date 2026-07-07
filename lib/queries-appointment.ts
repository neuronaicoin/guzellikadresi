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

// ---- Çalışma saatleri (working_hours tablosu) ----
// day_of_week: 0=Pazartesi ... 6=Pazar
export type WorkingHour = {
  day_of_week: number;
  open_time: string | null;   // "09:00"
  close_time: string | null;  // "18:00"
  is_closed: boolean;
};

export async function getWorkingHours(businessId: string): Promise<WorkingHour[]> {
  const { data } = await supabaseAuth
    .from('working_hours')
    .select('day_of_week, open_time, close_time, is_closed')
    .eq('business_id', businessId)
    .order('day_of_week', { ascending: true });
  return (data || []) as WorkingHour[];
}

// Tüm haftayı topluca kaydet (önce sil, sonra ekle — transaction gibi)
export async function saveWorkingHours(
  businessId: string,
  hours: WorkingHour[]
): Promise<{ ok: boolean; error?: string }> {
  const { error: delErr } = await supabaseAuth
    .from('working_hours')
    .delete()
    .eq('business_id', businessId);
  if (delErr) return { ok: false, error: delErr.message };

  const rows = hours.map((h) => ({
    business_id: businessId,
    day_of_week: h.day_of_week,
    open_time: h.is_closed ? null : h.open_time,
    close_time: h.is_closed ? null : h.close_time,
    is_closed: h.is_closed,
  }));
  const { error: insErr } = await supabaseAuth
    .from('working_hours')
    .insert(rows);
  if (insErr) return { ok: false, error: insErr.message };
  return { ok: true };
}

// ---- Randevu yönetimi (appointments tablosu) ----
export type Appointment = {
  id: string;
  service_id: string | null;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;   // "2026-07-12"
  appointment_time: string;   // "14:00:00"
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  service_name?: string | null;
};

// İşletmenin randevularını çek (hizmet adıyla birlikte)
export async function getAppointments(businessId: string): Promise<Appointment[]> {
  const { data } = await supabaseAuth
    .from('appointments')
    .select('id, service_id, customer_name, customer_phone, appointment_date, appointment_time, status, created_at, appointment_services(name)')
    .eq('business_id', businessId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });
  return (data || []).map((a: any) => ({
    id: a.id,
    service_id: a.service_id,
    customer_name: a.customer_name,
    customer_phone: a.customer_phone,
    appointment_date: a.appointment_date,
    appointment_time: a.appointment_time,
    status: a.status,
    created_at: a.created_at,
    service_name: a.appointment_services?.name ?? null,
  }));
}

// Randevu durumu güncelle (onayla / iptal)
export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'confirmed' | 'cancelled'
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAuth
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---- Elle saat bloklama (blocked_slots) ----
export type BlockedSlot = {
  id: string;
  blocked_date: string;
  blocked_time: string;
};

export async function getBlockedSlots(businessId: string): Promise<BlockedSlot[]> {
  const { data } = await supabaseAuth
    .from('blocked_slots')
    .select('id, blocked_date, blocked_time')
    .eq('business_id', businessId)
    .order('blocked_date', { ascending: true });
  return (data || []) as BlockedSlot[];
}

export async function addBlockedSlot(
  businessId: string,
  date: string,
  time: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAuth
    .from('blocked_slots')
    .insert({ business_id: businessId, blocked_date: date, blocked_time: time });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function removeBlockedSlot(
  slotId: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAuth
    .from('blocked_slots')
    .delete()
    .eq('id', slotId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
