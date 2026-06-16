import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const key = String(body.key || '');

    // Şifre kontrolü (Railway env: ADMIN_KEY)
    const adminKey = process.env.ADMIN_KEY || '';
    if (!adminKey || key !== adminKey) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceIso = since.toISOString();

    // 1) İşletme sayıları
    const { count: totalBiz } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    const { count: approvedBiz } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    const { count: pendingBiz } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'approved');

    // 2) Toplam etkinlikler (tüm zaman)
    const { data: allEvents } = await supabaseAdmin
      .from('business_events')
      .select('type');
    const totalAgg = { view: 0, phone: 0, whatsapp: 0, social: 0 };
    (allEvents || []).forEach((e: any) => {
      if (e.type === 'view') totalAgg.view++;
      else if (e.type === 'phone_click') totalAgg.phone++;
      else if (e.type === 'whatsapp_click') totalAgg.whatsapp++;
      else totalAgg.social++;
    });

    // 3) Son 30 gün etkinlikler
    const { data: recentEvents } = await supabaseAdmin
      .from('business_events')
      .select('type, business_id')
      .gte('created_at', sinceIso);
    const agg30 = { view: 0, phone: 0, whatsapp: 0, social: 0 };
    const viewByBiz: Record<string, number> = {};
    (recentEvents || []).forEach((e: any) => {
      if (e.type === 'view') { agg30.view++; viewByBiz[e.business_id] = (viewByBiz[e.business_id] || 0) + 1; }
      else if (e.type === 'phone_click') agg30.phone++;
      else if (e.type === 'whatsapp_click') agg30.whatsapp++;
      else agg30.social++;
    });

    // 4) Tüm işletmeler (isim + il + kategori) — dağılım + top için
    const { data: bizList } = await supabaseAdmin
      .from('businesses')
      .select('id, name, slug, created_at, provinces(name), districts(name), categories(name)')
      .order('created_at', { ascending: false });

    const bizMap: Record<string, any> = {};
    const provinceCount: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};
    (bizList || []).forEach((b: any) => {
      bizMap[b.id] = b;
      const pn = b.provinces?.name || 'Bilinmiyor';
      const cn = b.categories?.name || 'Bilinmiyor';
      provinceCount[pn] = (provinceCount[pn] || 0) + 1;
      categoryCount[cn] = (categoryCount[cn] || 0) + 1;
    });

    // En çok görüntülenen 10 işletme (son 30 gün)
    const topViewed = Object.entries(viewByBiz)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, views]) => ({
        name: bizMap[id]?.name || '—',
        slug: bizMap[id]?.slug || '',
        district: bizMap[id]?.districts?.name || '',
        province: bizMap[id]?.provinces?.name || '',
        views,
      }));

    // Şehir dağılımı (sıralı)
    const provinceDist = Object.entries(provinceCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // Kategori dağılımı (sıralı)
    const categoryDist = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // Son eklenen 8 işletme
    const recentBiz = (bizList || []).slice(0, 8).map((b: any) => ({
      name: b.name,
      slug: b.slug,
      district: b.districts?.name || '',
      province: b.provinces?.name || '',
      category: b.categories?.name || '',
      created_at: b.created_at,
    }));

    // ---- ARAMA İSTATİSTİKLERİ ----
    const { data: searches } = await supabaseAdmin
      .from('search_events')
      .select('query, results_count')
      .gte('created_at', sinceIso);

    const queryCount: Record<string, number> = {};
    const emptyQueryCount: Record<string, number> = {};
    (searches || []).forEach((s: any) => {
      const q = (s.query || '').toLocaleLowerCase('tr-TR').trim();
      if (!q) return;
      queryCount[q] = (queryCount[q] || 0) + 1;
      if (s.results_count === 0) emptyQueryCount[q] = (emptyQueryCount[q] || 0) + 1;
    });
    const topSearches = Object.entries(queryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([q, count]) => ({ q, count }));
    const emptySearches = Object.entries(emptyQueryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([q, count]) => ({ q, count }));
    const totalSearches = (searches || []).length;

    // ---- SAYFA GÖRÜNTÜLEME İSTATİSTİKLERİ ----
    const { data: pages } = await supabaseAdmin
      .from('page_events')
      .select('page_type, page_label')
      .gte('created_at', sinceIso);

    const catViews: Record<string, number> = {};
    const locViews: Record<string, number> = {};
    (pages || []).forEach((p: any) => {
      if (p.page_type === 'kategori') {
        catViews[p.page_label] = (catViews[p.page_label] || 0) + 1;
      } else if (p.page_type === 'il' || p.page_type === 'ilce' || p.page_type === 'hizmet') {
        locViews[p.page_label] = (locViews[p.page_label] || 0) + 1;
      }
    });
    const topCategories = Object.entries(catViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));
    const topLocations = Object.entries(locViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      ok: true,
      data: {
        biz: { total: totalBiz || 0, approved: approvedBiz || 0, pending: pendingBiz || 0 },
        total: totalAgg,
        last30: agg30,
        topViewed,
        provinceDist,
        categoryDist,
        recentBiz,
        topSearches,
        emptySearches,
        totalSearches,
        topCategories,
        topLocations,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
