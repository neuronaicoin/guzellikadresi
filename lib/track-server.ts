import { supabaseAdmin } from '@/lib/supabase-admin';

// Arama olayı kaydet (server tarafında).
export async function trackSearch(query: string, resultsCount: number) {
  const q = (query || '').trim();
  if (!q) return;
  try {
    const { error } = await supabaseAdmin.from('search_events').insert({
      query: q.slice(0, 200),
      results_count: resultsCount,
    });
    if (error) console.error('[trackSearch] insert error:', error.message);
  } catch (e: any) {
    console.error('[trackSearch] exception:', e?.message || e);
  }
}

// Sayfa görüntüleme olayı kaydet (kategori / il / ilçe / hizmet)
export async function trackPage(pageType: string, pageLabel: string, pageSlug?: string) {
  try {
    const { error } = await supabaseAdmin.from('page_events').insert({
      page_type: pageType,
      page_label: pageLabel,
      page_slug: pageSlug || null,
    });
    if (error) console.error('[trackPage] insert error:', error.message);
  } catch (e: any) {
    console.error('[trackPage] exception:', e?.message || e);
  }
}
