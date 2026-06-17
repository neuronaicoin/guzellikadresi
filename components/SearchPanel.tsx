'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Prov = { id: number; name: string; slug: string };
type Dist = { id: number; name: string; slug: string };

export default function SearchPanel({ provinces }: { provinces: Prov[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [provId, setProvId] = useState(params.get('il') || '');
  const [distId, setDistId] = useState(params.get('ilce') || '');
  const [districts, setDistricts] = useState<Dist[]>([]);

  // İl seçilince ilçeleri getir
  useEffect(() => {
    if (!provId) { setDistricts([]); setDistId(''); return; }
    fetch(`/api/districts?province=${provId}`)
      .then((r) => r.json())
      .then((d) => setDistricts(d.districts || d || []))
      .catch(() => setDistricts([]));
  }, [provId]);

  function search() {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (provId) sp.set('il', provId);
    if (distId) sp.set('ilce', distId);
    router.push(`/ara?${sp.toString()}`);
  }

  // Popüler aramalar
  const populer = ['Lazer epilasyon', 'Kuaför', 'Manikür', 'Cilt bakımı', 'Saç ekimi', 'Masaj', 'Botoks', 'Pilates'];

  return (
    <div className="ga-searchpanel">
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px' }}>Ne arıyorsun?</h1>
      <p style={{ fontSize: 14, color: '#778', margin: '0 0 16px' }}>Hizmet veya işletme ara, istersen bölgeni seç.</p>

      {/* 1. Arama kutusu */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>1. Ne arıyorsun?</label>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') search(); }}
          placeholder="örn. lazer, kuaför, manikür, botoks…"
          style={{ width: '100%', padding: '14px 16px', fontSize: 15, border: '2px solid var(--gold)', borderRadius: 12, fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
      </div>

      {/* 2. İl + ilçe */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>2. Nerede? (opsiyonel)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={provId} onChange={(e) => setProvId(e.target.value)}
            style={{ flex: 1, padding: '12px', fontSize: 14, border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'inherit', background: '#fff' }}>
            <option value="">Tüm Türkiye</option>
            {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={distId} onChange={(e) => setDistId(e.target.value)} disabled={!provId}
            style={{ flex: 1, padding: '12px', fontSize: 14, border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'inherit', background: provId ? '#fff' : '#f5f5f7' }}>
            <option value="">{provId ? 'Tüm ilçeler' : 'Önce il seçin'}</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <button onClick={search}
        style={{ width: '100%', padding: '15px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
        🔍 Ara
      </button>

      {/* Popüler aramalar */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#99a', marginBottom: 10 }}>POPÜLER ARAMALAR</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {populer.map((p) => (
            <button key={p} onClick={() => { setQ(p); }}
              style={{ background: '#fff', border: '1.5px solid var(--gold)', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', fontFamily: 'inherit' }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
