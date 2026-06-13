import Link from 'next/link';
import Image from 'next/image';
import type { BusinessCard as BizCard } from '@/lib/types';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  const d = Math.floor(h / 24);
  return `${d} gün önce`;
}

export default function BusinessCard({ b, isNew = false, isFeat = false }: { b: BizCard; isNew?: boolean; isFeat?: boolean }) {
  return (
    <Link href={`/isletme/${b.slug}`} className="ga-bcard">
      <div className="ga-bcard-cover">
        {b.cover_url ? (
          <Image src={b.cover_url} alt={b.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:880px) 100vw, 320px" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#b9c2da', fontSize: 13 }}>Fotoğraf yok</div>
        )}
        {b.category_name && <span className="ga-pin-cat">{b.category_name}</span>}
        {isNew && <span className="ga-new">YENİ</span>}
      </div>
      <div style={{ padding: 14 }}>
        <h3 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>{b.name}</h3>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 5 }}>
          📍 {[b.district_name, b.province_name].filter(Boolean).join(', ')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 11 }}>
          {b.services.slice(0, 3).map((s, i) => (
            <span key={i} className={isFeat ? 'ga-tag-feat' : 'ga-tag'}>{s}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 13, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
          <span style={{ fontSize: 11.5, color: isFeat ? 'var(--gold)' : '#1f9d6b', fontWeight: 700 }}>
            {isFeat ? '⭐ Öne çıkan' : `● ${timeAgo(b.created_at)}`}
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gold)' }}>İncele →</span>
        </div>
      </div>
    </Link>
  );
}
