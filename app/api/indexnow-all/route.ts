import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { notifyIndexNow } from '@/lib/indexnow';

export const runtime = 'nodejs';

// Şifre korumalı: tüm sayfaları (işletmeler + kategoriler + iller + programatik) IndexNow'a bildir.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const urls: string[] = ['/'];

    // İşletmeler + dolu programatik kombinasyonlar
    const { data: biz } = await supabaseAdmin
      .from('businesses')
      .select('slug, provinces(slug), districts(slug), categories(slug)')
      .eq('status', 'approved');

    const seen = new Set<string>();
    (biz || []).forEach((b: any) => {
      urls.push(`/isletme/${b.slug}`);
      const il = b.provinces?.slug, ilce = b.districts?.slug, hizmet = b.categories?.slug;
      if (il && ilce && hizmet) {
        const k = `/${il}/${ilce}/${hizmet}`;
        if (!seen.has(k)) { seen.add(k); urls.push(k); }
      }
    });

    // Kategoriler
    const { data: cats } = await supabaseAdmin.from('categories').select('slug');
    (cats || []).forEach((c: any) => urls.push(`/kategori/${c.slug}`));

    await notifyIndexNow(urls);

    return NextResponse.json({ ok: true, count: urls.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
