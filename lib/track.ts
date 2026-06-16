'use client';

import { supabase } from '@/lib/supabase';

type EventType = 'view' | 'phone_click' | 'whatsapp_click' | 'website_click' | 'instagram_click' | 'facebook_click' | 'x_click' | 'linkedin_click';

// Olay kaydet (ziyaretçi anon olarak ekler). Hata sessizce yutulur — istatistik kritik değil.
export async function trackEvent(businessId: string, type: EventType) {
  // GA'ya da gönder (gtag varsa)
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', type, { business_id: businessId });
    }
  } catch {
    // sessiz
  }
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

// Google Analytics'e özel event gönder (gtag varsa). Params opsiyonel.
export function trackGA(eventName: string, params?: Record<string, unknown>) {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', eventName, params || {});
    }
  } catch {
    // sessiz
  }
}
