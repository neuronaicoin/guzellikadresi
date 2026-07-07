import { supabase } from '@/lib/supabase';

// ============================================================
//  RANDEVU — MÜŞTERİ TARAFI QUERY'LERİ (public, anon client)
//  RLS: services/working_hours/blocked_slots herkese okuma açık.
// ============================================================

export type PublicService = {
  id: string;
  name: string;
  duration_min: number;
  price: number | null;
};

export type PublicWorkingHour = {
  day_of_week: number;   // 0=Pazartesi..6=Pazar
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

// İşletmenin randevu hizmetleri
export async function getPublicServices(businessId: string): Promise<PublicService[]> {
  const { data } = await supabase
    .from('appointment_services')
    .select('id, name, duration_min, price')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true });
  return (data || []) as PublicService[];
}

// İşletmenin çalışma saatleri
export async function getPublicWorkingHours(businessId: string): Promise<PublicWorkingHour[]> {
  const { data } = await supabase
    .from('working_hours')
    .select('day_of_week, open_time, close_time, is_closed')
    .eq('business_id', businessId)
    .order('day_of_week', { ascending: true });
  return (data || []) as PublicWorkingHour[];
}

// Belirli bir gün için: o gün alınmış randevu saatleri + bloklu saatler
// (Kalan kapasite hesabı client'ta staff_count ile yapılır.)
export type SlotInfo = { slot_time: string; taken: number; blocked: boolean };

export async function getDayAvailability(
  businessId: string,
  dateISO: string   // "2026-07-12"
): Promise<SlotInfo[]> {
  const { data, error } = await supabase.rpc('get_slot_availability', {
    p_business_id: businessId,
    p_date: dateISO,
  });
  if (error || !data) return [];
  // RPC time formatı "14:00:00" gelebilir → "14:00"a normalize et
  return (data as any[]).map((r) => ({
    slot_time: (r.slot_time || '').slice(0, 5),
    taken: r.taken ?? 0,
    blocked: r.blocked ?? false,
  }));
}
