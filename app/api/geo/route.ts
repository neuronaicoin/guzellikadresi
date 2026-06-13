import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Türkçe il adını normalize edip slug'a çevir
function toSlug(s: string): string {
  const tr: Record<string, string> = { 'ı':'i','İ':'i','ş':'s','Ş':'s','ğ':'g','Ğ':'g','ü':'u','Ü':'u','ö':'o','Ö':'o','ç':'c','Ç':'c' };
  let out = s.trim();
  for (const k in tr) out = out.split(k).join(tr[k]);
  return out.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(req: NextRequest) {
  // Railway/proxy arkasında gerçek IP
  const fwd = req.headers.get('x-forwarded-for');
  const ip = fwd ? fwd.split(',')[0].trim() : '';

  try {
    // ip-api.com ücretsiz (il bilgisi 'regionName' alanında)
    const url = ip
      ? `http://ip-api.com/json/${ip}?fields=status,country,regionName,city&lang=tr`
      : `http://ip-api.com/json/?fields=status,country,regionName,city&lang=tr`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    if (data.status === 'success' && data.country === 'Türkiye') {
      // regionName genelde il adı (örn. "İstanbul")
      const il = data.regionName || data.city || '';
      return NextResponse.json({ ok: true, il, ilSlug: toSlug(il) });
    }
    return NextResponse.json({ ok: false });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
