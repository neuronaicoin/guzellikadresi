import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { notifyIndexNow } from '@/lib/indexnow';
import { getAllPosts } from '@/lib/data/blog';

export const runtime = 'nodejs';

// Şifre korumalı: tüm sayfaları (işletmeler + kategoriler + iller + programatik) IndexNow'a bildir.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const urls: string[] = ['/'];

    // İşletmeler (önce basit sorgu - slug'lar garanti gelsin)
    const { data: biz } = await supabaseAdmin
      .from('businesses')
      .select('slug')
      .eq('status', 'approved');
    (biz || []).forEach((b: any) => {
      if (b.slug) urls.push(`/isletme/${b.slug}`);
    });

    // Dolu programatik kombinasyonlar (ayrı sorgu - join hatası işletmeleri etkilemesin)
    try {
      const { data: bizLoc } = await supabaseAdmin
        .from('businesses')
        .select('provinces(slug), districts(slug), categories(slug)')
        .eq('status', 'approved');
      const seen = new Set<string>();
      (bizLoc || []).forEach((b: any) => {
        const il = b.provinces?.slug, ilce = b.districts?.slug, hizmet = b.categories?.slug;
        if (il && ilce && hizmet) {
          const k = `/${il}/${ilce}/${hizmet}`;
          if (!seen.has(k)) { seen.add(k); urls.push(k); }
        }
      });
    } catch {}

    // Kategoriler
    try {
      const { data: cats } = await supabaseAdmin.from('categories').select('slug');
      (cats || []).forEach((c: any) => { if (c.slug) urls.push(`/kategori/${c.slug}`); });
    } catch {}

    // Blog yazıları (rehber)
    try {
      urls.push('/rehber');
      getAllPosts().forEach((p) => { if (p.slug) urls.push(`/rehber/${p.slug}`); });
    } catch {}

    await notifyIndexNow(urls);

    return NextResponse.json({ ok: true, count: urls.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
