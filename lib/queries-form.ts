import { supabase } from '@/lib/supabase';

// Kayıt formu için: tüm kategoriler + hizmetleri
export async function getCategoriesForForm() {
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, emoji, services(id, name, slug, sort_order)')
    .eq('is_active', true)
    .order('sort_order');

  return (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    emoji: c.emoji,
    services: (c.services || [])
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((s: any) => ({ id: s.id, name: s.name })),
  }));
}

// Form için iller
export async function getProvincesForForm() {
  const { data } = await supabase
    .from('provinces')
    .select('id, name, slug')
    .order('name');
  return data || [];
}
