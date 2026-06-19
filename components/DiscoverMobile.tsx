'use client';

import Link from 'next/link';
import type { Province } from '@/lib/types';

type Cat = { id: number; name: string; slug: string; emoji: string | null };

// Kategori odaklı keşfet (mobil). Üstte hero, altında kategori kutuları.
// Kullanıcı kategoriye girince kategori sayfasındaki "Bölge seç" ile
// il/ilçe filtreler (il/ilçe SEO sayfaları korunur).
export default function DiscoverMobile({
  categories,
  total = 0,
}: {
  categories: Cat[];
  provinces?: Province[];
  total?: number;
}) {
  return (
    <div className="ga-discover">
      {/* HERO */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>
          ✦ Türkiye'nin güzellik &amp; bakım adresi
        </span>
        <h1 style={{ fontSize: 24, lineHeight: 1.2, letterSpacing: '-.5px', fontWeight: 800, margin: '0 0 8px', color: 'var(--navy)' }}>
          Bölgendeki <span style={{ color: 'var(--gold)' }}>güzellik ve bakım merkezlerini</span> keşfet
        </h1>
        <p style={{ fontSize: 14, color: '#667', margin: '0 0 6px', fontWeight: 600 }}>
          Semtindeki en iyi uzmanları keşfet, anında ulaş
        </p>
        <div style={{ width: 90, height: 4, background: 'var(--gold)', borderRadius: 3, margin: '0 0 14px' }} />
        <div style={{ display: 'flex', gap: 22 }}>
          <Stat n={total > 0 ? `${total}+` : '—'} l="Kayıtlı işletme" />
          <Stat n="13" l="Hizmet kategorisi" />
          <Stat n="81" l="İl genelinde" />
        </div>
      </div>

      {/* POPÜLER KATEGORİLER — sarı çerçeveli kutu içinde */}
      <div style={{ border: '2px solid var(--gold)', borderRadius: 16, padding: '14px 12px', background: 'rgba(201,162,75,0.05)' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--navy)', margin: '0 0 10px' }}>POPÜLER KATEGORİLER</div>
        <div className="ga-disc-cats">
          {categories.map((c) => (
            <Link key={c.id} href={`/kategori/${c.slug}`} className="ga-disc-cat" style={{ borderColor: 'var(--gold)', textDecoration: 'none' }}>
              <span className="ga-disc-cat-emoji">{c.emoji}</span>
              <span className="ga-disc-cat-name">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 11.5, color: '#889', marginTop: 3 }}>{l}</div>
    </div>
  );
}
