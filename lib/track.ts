'use client';

import { supabase } from '@/lib/supabase';

type EventType = 'view' | 'phone_click' | 'whatsapp_click';

// Olay kaydet (ziyaretçi anon olarak ekler). Hata sessizce yutulur — istatistik kritik değil.
export async function trackEvent(businessId: string, type: EventType) {
  try {
    await supabase.from('business_events').insert({ business_id: businessId, type });
  } catch {
    // sessiz
  }
}

// Görüntülenme — aynı oturumda tekrar saymamak için sessionStorage ile bir kez
export async function trackView(businessId: string) {
  try {
    const key = `ga_viewed_${businessId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    await trackEvent(businessId, 'view');
  } catch {
    await trackEvent(businessId, 'view');
  }
}
