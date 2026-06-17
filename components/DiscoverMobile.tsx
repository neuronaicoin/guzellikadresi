'use client';

import Link from 'next/link';
import type { Province } from '@/lib/types';

type Cat = { id: number; name: string; slug: string; emoji: string | null };

// Kategori odaklı keşfet: açılışta doğrudan kategoriler gösterilir.
// Kullanıcı kategoriye girince, kategori sayfasındaki "Bölge seç" ile
// il/ilçe filtreleme yapar (il/ilçe SEO sayfaları korunur).
export default function DiscoverMobile({
  categories,
}: {
  categories: Cat[];
  provinces?: Province[];
}) {
  return (
    <div className="ga-discover">
      {/* Başlık */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px', letterSpacing: '-.3px' }}>
          Bölgendeki güzellik ve bakım merkezlerini keşfet
        </h2>
        <p style={{ fontSize: 13, color: '#778', margin: 0 }}>
          Ne arıyorsun? Bir kategori seç, sonra bölgeni filtrele.
        </p>
      </div>

      {/* Popüler kategoriler — sarı çerçeveli kutular */}
      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#99a', margin: '4px 0 8px' }}>POPÜLER KATEGORİLER</div>
      <div className="ga-disc-cats">
        {categories.map((c) => (
          <Link key={c.id} href={`/kategori/${c.slug}`} className="ga-disc-cat" style={{ borderColor: 'var(--gold)', textDecoration: 'none' }}>
            <span className="ga-disc-cat-emoji">{c.emoji}</span>
            <span className="ga-disc-cat-name">{c.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
