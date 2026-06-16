import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// /api/coverage?province=34 → o ildeki dolu ilçe ve kategori sayıları
// Dönüş: { districts: {slug: count}, categories: {slug: count} }
export async function GET(req: NextRequest) {
  const provinceId = req.nextUrl.searchParams.get('province');
  if (!provinceId) return NextResponse.json({ ok: false });

  try {
    const { data } = await supabaseAdmin
      .from('businesses')
      .select('districts(slug), categories(slug)')
      .eq('province_id', Number(provinceId))
      .eq('status', 'approved');

    const districts: Record<string, number> = {};
    const categories: Record<string, number> = {};
    (data || []).forEach((b: any) => {
      const ds = b.districts?.slug;
      const cs = b.categories?.slug;
      if (ds) districts[ds] = (districts[ds] || 0) + 1;
      if (cs) categories[cs] = (categories[cs] || 0) + 1;
    });

    return NextResponse.json({ ok: true, districts, categories });
  } catch {
    return NextResponse.json({ ok: false, districts: {}, categories: {} });
  }
}
