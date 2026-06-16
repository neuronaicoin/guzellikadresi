import { supabaseAdmin } from '@/lib/supabase-admin';

// Arama olayı kaydet (server tarafında). Hata sessizce yutulur.
export async function trackSearch(query: string, resultsCount: number) {
  const q = (query || '').trim();
  if (!q) return;
  try {
    await supabaseAdmin.from('search_events').insert({
      query: q.slice(0, 200),
      results_count: resultsCount,
    });
  } catch {
    // sessiz
  }
}

// Sayfa görüntüleme olayı kaydet (kategori / il / ilçe / hizmet)
export async function trackPage(pageType: string, pageLabel: string, pageSlug?: string) {
  try {
    await supabaseAdmin.from('page_events').insert({
      page_type: pageType,
      page_label: pageLabel,
      page_slug: pageSlug || null,
    });
  } catch {
    // sessiz
  }
}
