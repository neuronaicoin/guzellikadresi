import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// ============================================================
//  POST /api/appointment — randevu oluştur (çakışma korumalı)
//  create_appointment RPC'sini çağırır (atomik kapasite kontrolü).
// ============================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { business_id, service_id, name, phone, date, time } = body || {};

    // Basit doğrulama
    if (!business_id || !name || !phone || !date || !time) {
      return NextResponse.json(
        { ok: false, error: 'Eksik bilgi. Lütfen tüm alanları doldurun.' },
        { status: 400 }
      );
    }

    // RPC çağır (RLS bypass + atomik çakışma önleme fonksiyonun içinde)
    const { data, error } = await supabaseAdmin.rpc('create_appointment', {
      p_business_id: business_id,
      p_service_id: service_id || null,
      p_name: String(name).trim(),
      p_phone: String(phone).trim(),
      p_date: date,
      p_time: time,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'Randevu oluşturulamadı. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    // RPC { ok: true/false, ... } json döndürür
    const result = data as { ok: boolean; error?: string; id?: string; remaining?: number };
    if (!result?.ok) {
      return NextResponse.json(
        { ok: false, error: result?.error || 'Randevu alınamadı.' },
        { status: 409 }   // 409 Conflict (slot dolu vb.)
      );
    }

    return NextResponse.json({ ok: true, id: result.id, remaining: result.remaining });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'Beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}
