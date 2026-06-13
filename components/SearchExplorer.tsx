'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Province, District } from '@/lib/types';

type Svc = { id: number; name: string; slug: string };
type Cat = { id: number; name: string; slug: string; emoji: string | null; business_count?: number; services: Svc[] };

export default function SearchExplorer({
  categories,
  provinces,
}: {
  categories: Cat[];
  provinces: Province[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<'cat' | 'svc' | 'loc'>('cat');
  const [cat, setCat] = useState<Cat | null>(null);
  const [svc, setSvc] = useState<Svc | null>(null);

  const [cityId, setCityId] = useState<number | null>(null);
  const [citySlug, setCitySlug] = useState('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [distSlug, setDistSlug] = useState('');

  async function pickCity(id: number) {
    setCityId(id);
    const p = provinces.find((x) => x.id === id);
    setCitySlug(p?.slug || '');
    setDistSlug('');
    setDistricts([]);
    if (id) {
      try {
        const res = await fetch(`/api/districts?province=${id}`);
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch { setDistricts([]); }
    }
  }

  function goResults() {
    if (!cat) return;
    let url = `/kategori/${cat.slug}`;
    const qp: string[] = [];
    if (svc) qp.push(`hizmet=${svc.slug}`);
    if (citySlug) qp.push(`il=${citySlug}`);
    if (distSlug) qp.push(`ilce=${distSlug}`);
    if (qp.length) url += `?${qp.join('&')}`;
    router.push(url);
  }

  // ADIM 1: KATEGORİLER
  if (step === 'cat') {
    return (
      <div className="ga-explore">
        <div className="ga-explore-title">Ne arıyorsunuz?</div>
        <div className="ga-explore-list">
          {categories.map((c) => (
            <button key={c.id} className="ga-explore-row" onClick={() => { setCat(c); setStep('svc'); }}>
              <span className="ga-explore-emoji">{c.emoji}</span>
              <span className="ga-explore-info">
                <span className="ga-explore-name">{c.name}</span>
                <span className="ga-explore-sub">{c.services.slice(0, 3).map((s) => s.name).join(', ')}{c.services.length > 3 ? '…' : ''}</span>
              </span>
              <span className="ga-explore-arrow">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ADIM 2: HİZMETLER
  if (step === 'svc' && cat) {
    return (
      <div className="ga-explore">
        <button className="ga-explore-back" onClick={() => { setStep('cat'); setCat(null); }}>‹ Kategoriler</button>
        <div className="ga-explore-title">{cat.emoji} {cat.name} — Hizmet seçin</div>
        <div className="ga-explore-list">
          <button className="ga-explore-row" onClick={() => { setSvc(null); setStep('loc'); }}>
            <span className="ga-explore-emoji">⭐</span>
            <span className="ga-explore-info"><span className="ga-explore-name">Tüm {cat.name}</span><span className="ga-explore-sub">Tüm hizmetler</span></span>
            <span className="ga-explore-arrow">›</span>
          </button>
          {cat.services.map((s) => (
            <button key={s.id} className="ga-explore-row" onClick={() => { setSvc(s); setStep('loc'); }}>
              <span className="ga-explore-info"><span className="ga-explore-name">{s.name}</span></span>
              <span className="ga-explore-arrow">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ADIM 3: KONUM
  return (
    <div className="ga-explore">
      <button className="ga-explore-back" onClick={() => setStep('svc')}>‹ Hizmetler</button>
      <div className="ga-explore-title">{svc ? svc.name : `Tüm ${cat?.name}`} — Nerede?</div>
      <div className="ga-explore-loc">
        <label>İl</label>
        <select value={cityId ?? ''} onChange={(e) => pickCity(Number(e.target.value))}>
          <option value="">İl seçin…</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <label>İlçe</label>
        <select value={distSlug} onChange={(e) => setDistSlug(e.target.value)} disabled={!cityId}>
          <option value="">{cityId ? 'Tüm ilçeler' : 'Önce il seçin'}</option>
          {districts.map((d) => <option key={d.id} value={d.slug}>{d.name}</option>)}
        </select>

        <button className="ga-explore-search" onClick={goResults}>
          🔍 İşletmeleri Göster
        </button>
        <button className="ga-explore-skip" onClick={goResults}>
          Konum farketmez, hepsini göster
        </button>
      </div>
    </div>
  );
}
