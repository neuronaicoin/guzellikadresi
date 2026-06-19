'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Province, District } from '@/lib/types';

export default function CategoryFilter({
  categorySlug,
  provinces,
  currentProvince,
  currentDistrict,
  initialDistricts,
}: {
  categorySlug: string;
  provinces: Province[];
  currentProvince: { id: number; slug: string; name: string } | null;
  currentDistrict: { id: number; slug: string; name: string } | null;
  initialDistricts: District[];
}) {
  const router = useRouter();
  const [provSlug, setProvSlug] = useState(currentProvince?.slug || '');
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [distSlug, setDistSlug] = useState(currentDistrict?.slug || '');

  async function onProvinceChange(slug: string) {
    setProvSlug(slug);
    setDistSlug('');
    setDistricts([]);
    if (!slug) {
      router.push(`/kategori/${categorySlug}`);
      return;
    }
    const prov = provinces.find((p) => p.slug === slug);
    if (prov) {
      try {
        const res = await fetch(`/api/districts?province=${prov.id}`);
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch {
        setDistricts([]);
      }
    }
    router.push(`/kategori/${categorySlug}?il=${slug}`);
  }

  function onDistrictChange(slug: string) {
    setDistSlug(slug);
    if (slug) router.push(`/kategori/${categorySlug}?il=${provSlug}&ilce=${slug}`);
    else router.push(`/kategori/${categorySlug}?il=${provSlug}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '0 0 18px' }}>
      {/* Geri tuşu (il/ilçe seçiliyse) */}
      {provSlug && (
        <button
          onClick={() => onProvinceChange('')}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--navy)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
          ‹ Tüm Türkiye'ye dön
        </button>
      )}

      {/* İL SEÇ — büyük, sarı çerçeveli */}
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
          📍 İl seç
        </label>
        <select
          value={provSlug}
          onChange={(e) => onProvinceChange(e.target.value)}
          style={{ width: '100%', padding: '14px 16px', fontSize: 16, fontWeight: 600, color: 'var(--navy)', border: '2px solid var(--gold)', borderRadius: 12, background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box', cursor: 'pointer' }}>
          <option value="">Tüm Türkiye</option>
          {provinces.map((p) => <option key={p.id} value={p.slug}>{p.name}</option>)}
        </select>
      </div>

      {/* İLÇE SEÇ — büyük, sarı çerçeveli */}
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
          🏘️ İlçe seç
        </label>
        <select
          value={distSlug}
          onChange={(e) => onDistrictChange(e.target.value)}
          disabled={!provSlug}
          style={{ width: '100%', padding: '14px 16px', fontSize: 16, fontWeight: 600, color: provSlug ? 'var(--navy)' : '#aab', border: '2px solid var(--gold)', borderRadius: 12, background: provSlug ? '#fff' : '#f5f5f7', fontFamily: 'inherit', boxSizing: 'border-box', cursor: provSlug ? 'pointer' : 'not-allowed' }}>
          <option value="">{provSlug ? 'Tüm ilçeler' : 'Önce il seçin'}</option>
          {districts.map((d) => <option key={d.id} value={d.slug}>{d.name}</option>)}
        </select>
      </div>
    </div>
  );
}
