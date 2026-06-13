// İşletme adından URL-dostu slug üretir.
export function slugify(s: string): string {
  const tr: Record<string, string> = {
    'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g',
    'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c',
  };
  let out = s.trim();
  for (const k in tr) out = out.split(k).join(tr[k]);
  out = out.toLowerCase();
  out = out.replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return out || 'isletme';
}

// Kısa benzersiz ek (slug çakışmasını önler)
export function shortId(len = 5): string {
  return Math.random().toString(36).slice(2, 2 + len);
}
