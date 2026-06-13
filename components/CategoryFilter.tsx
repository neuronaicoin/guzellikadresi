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
    <div className="ga-catfilter">
      <span className="ga-catfilter-label">📍 Bölge seç:</span>
      <select value={provSlug} onChange={(e) => onProvinceChange(e.target.value)}>
        <option value="">Tüm Türkiye</option>
        {provinces.map((p) => <option key={p.id} value={p.slug}>{p.name}</option>)}
      </select>
      <select value={distSlug} onChange={(e) => onDistrictChange(e.target.value)} disabled={!provSlug}>
        <option value="">{provSlug ? 'Tüm ilçeler' : 'Önce il seçin'}</option>
        {districts.map((d) => <option key={d.id} value={d.slug}>{d.name}</option>)}
      </select>
    </div>
  );
}
