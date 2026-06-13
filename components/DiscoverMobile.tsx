'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Province } from '@/lib/types';

type Cat = { id: number; name: string; slug: string; emoji: string | null };

export default function DiscoverMobile({
  categories,
  provinces,
}: {
  categories: Cat[];
  provinces: Province[];
}) {
  const router = useRouter();
  const [il, setIl] = useState<string>('');
  const [ilSlug, setIlSlug] = useState<string>('');
  const [picking, setPicking] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // önce kayıtlı tercih
    let saved = '';
    try { saved = localStorage.getItem('ga_il') || ''; } catch {}
    if (saved) {
      const p = provinces.find((x) => x.slug === saved);
      if (p) { setIl(p.name); setIlSlug(p.slug); setLoaded(true); return; }
    }
    // yoksa IP'den tespit
    fetch('/api/geo')
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.ilSlug) {
          const p = provinces.find((x) => x.slug === d.ilSlug);
          if (p) { setIl(p.name); setIlSlug(p.slug); }
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [provinces]);

  function chooseCity(slug: string, name: string) {
    setIl(name); setIlSlug(slug); setPicking(false);
    try { localStorage.setItem('ga_il', slug); } catch {}
  }

  return (
    <div className="ga-discover">
      {/* Konum şeridi */}
      <div className="ga-disc-loc">
        <span>📍 {loaded ? (il ? <b>{il}</b> : 'Konum seçilmedi') : 'Konum bulunuyor…'}</span>
        <button onClick={() => setPicking(!picking)}>{picking ? 'Kapat' : 'Değiştir'}</button>
      </div>

      {picking && (
        <div className="ga-disc-citylist">
          {provinces.map((p) => (
            <button key={p.id} onClick={() => chooseCity(p.slug, p.name)} className={ilSlug === p.slug ? 'sel' : ''}>{p.name}</button>
          ))}
        </div>
      )}

      {/* O ildeki işletmeleri gör butonu */}
      {ilSlug && (
        <button className="ga-disc-cta" onClick={() => router.push(`/${ilSlug}`)}>
          {il}'daki tüm işletmeleri gör →
        </button>
      )}

      {/* Kategoriler ikonlu liste */}
      <div className="ga-disc-cats-title">Kategoriler</div>
      <div className="ga-disc-cats">
        {categories.map((c) => (
          <button
            key={c.id}
            className="ga-disc-cat"
            onClick={() => router.push(ilSlug ? `/kategori/${c.slug}?il=${ilSlug}` : `/kategori/${c.slug}`)}
          >
            <span className="ga-disc-cat-emoji">{c.emoji}</span>
            <span className="ga-disc-cat-name">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
