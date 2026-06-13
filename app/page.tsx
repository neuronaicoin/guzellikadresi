import { supabase } from '@/lib/supabase';
import { siteConfig } from '@/lib/siteConfig';

// Her istekte taze veri yerine, 1 saat cache (hız için ISR)
export const revalidate = 3600;

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, emoji, slug')
    .eq('is_active', true)
    .order('sort_order');
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export default async function HomePage() {
  const { data: categories, error } = await getCategories();

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '40px 22px' }}>
      <div
        style={{
          background: 'var(--navy)',
          color: '#fff',
          borderRadius: 18,
          padding: '34px 30px',
          marginBottom: 28,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
          {siteConfig.brandName}{' '}
          <span style={{ color: 'var(--gold)' }}>çalışıyor ✓</span>
        </h1>
        <p style={{ color: '#c5cde0', marginTop: 8, fontSize: 15 }}>
          Kurulum testi — Supabase bağlantısı ve veritabanı kontrolü.
        </p>
      </div>

      <h2 style={{ fontSize: 18, color: 'var(--navy)', marginBottom: 14 }}>
        Veritabanından gelen kategoriler:
      </h2>

      {error ? (
        <div
          style={{
            background: '#fde8e8',
            border: '1px solid #f5b5b5',
            color: '#a12',
            padding: 16,
            borderRadius: 12,
          }}
        >
          <b>Supabase bağlantı hatası:</b> {error}
          <br />
          <small>
            Railway environment variable&apos;larını (SUPABASE_URL, ANON_KEY)
            kontrol et.
          </small>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {categories?.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>{c.emoji}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
            </div>
          ))}
        </div>
      )}

      <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 24 }}>
        {categories
          ? `${categories.length} kategori başarıyla yüklendi.`
          : ''}
      </p>
    </main>
  );
}
