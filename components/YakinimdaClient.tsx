'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Prov = { id: number; name: string; slug: string };

export default function YakinimdaClient({ provinces }: { provinces: Prov[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'found' | 'notfound'>('loading');
  const [ilAdi, setIlAdi] = useState('');

  useEffect(() => {
    let done = false;
    fetch('/api/geo', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (done) return;
        if (d.ok && d.ilSlug) {
          // Slug gerçekten il listemizde var mı kontrol et
          const match = provinces.find((p) => p.slug === d.ilSlug);
          if (match) {
            setIlAdi(match.name);
            setStatus('found');
            // 1 sn sonra il sayfasına yönlendir
            setTimeout(() => router.push(`/${match.slug}`), 900);
            return;
          }
        }
        setStatus('notfound');
      })
      .catch(() => { if (!done) setStatus('notfound'); });
    return () => { done = true; };
  }, [provinces, router]);

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📍</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 8px' }}>Konumun belirleniyor…</h1>
        <p style={{ fontSize: 14, color: '#778' }}>Sana en yakın işletmeleri bulalım</p>
      </div>
    );
  }

  if (status === 'found') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', margin: '0 0 8px' }}>{ilAdi}</h1>
        <p style={{ fontSize: 14, color: '#778' }}>{ilAdi} işletmelerine yönlendiriliyorsun…</p>
      </div>
    );
  }

  // Bulunamadı: kullanıcı kendi ilini seçsin
  return (
    <div style={{ padding: '30px 20px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', margin: '0 0 8px' }}>Bölgeni seç</h1>
        <p style={{ fontSize: 14, color: '#778' }}>Konumunu belirleyemedik. İlini seçersen oradaki işletmeleri gösterelim.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {provinces.map((p) => (
          <Link key={p.id} href={`/${p.slug}`}
            style={{ display: 'block', padding: '14px 12px', background: '#fff', border: '1.5px solid var(--gold)', borderRadius: 12, textDecoration: 'none', color: 'var(--navy)', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
