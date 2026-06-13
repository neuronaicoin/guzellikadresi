'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Province, District } from '@/lib/types';

const SERVICE_LIMIT = 10; // kategori altında ilk kaç hizmet görünsün

export default function Sidebar({
  categories,
  provinces,
}: {
  categories: Category[];
  provinces: Province[];
}) {
  const router = useRouter();
  const [openCat, setOpenCat] = useState<number | null>(null);
  const [expandedSvc, setExpandedSvc] = useState<Set<number>>(new Set());

  // mobil panel açma/kapama
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileLocOpen, setMobileLocOpen] = useState(false);

  // konum
  const [city, setCity] = useState<Province | null>(null);
  const [district, setDistrict] = useState<District | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [openSS, setOpenSS] = useState<'city' | 'dist' | null>(null);
  const [q, setQ] = useState('');

  async function pickCity(p: Province) {
    setCity(p);
    setDistrict(null);
    setOpenSS(null);
    setQ('');
    try {
      const res = await fetch(`/api/districts?province=${p.id}`);
      const data = await res.json();
      setDistricts(data.districts || []);
    } catch {
      setDistricts([]);
    }
  }

  function doSearch() {
    if (!city) return;
    let url = `/${city.slug}`;
    if (district) url += `/${district.slug}`;
    router.push(url);
  }

  function toggleSvcExpand(catId: number) {
    const next = new Set(expandedSvc);
    if (next.has(catId)) next.delete(catId); else next.add(catId);
    setExpandedSvc(next);
  }

  const filteredCities = provinces.filter((p) =>
    p.name.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr'))
  );
  const filteredDists = districts.filter((d) =>
    d.name.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr'))
  );

  return (
    <aside className="ga-sidebar">
      {/* KATEGORİ AĞACI */}
      <div className="ga-box">
        <div className="ga-box-h ga-box-h-toggle" onClick={() => setMobileCatOpen(!mobileCatOpen)}>
          <span><span style={{ color: 'var(--gold)' }}>▤</span> Kategoriler</span>
          <span className="ga-mobile-caret">{mobileCatOpen ? '▴' : '▾'}</span>
        </div>
        <div className={`ga-box-body ${mobileCatOpen ? 'mob-open' : ''}`} style={{ padding: 6 }}>
          {categories.map((c) => {
            const svcs = c.services || [];
            const isExpanded = expandedSvc.has(c.id);
            const visibleSvcs = isExpanded ? svcs : svcs.slice(0, SERVICE_LIMIT);
            return (
              <div key={c.id}>
                <div
                  onClick={() => setOpenCat(openCat === c.id ? null : c.id)}
                  className="ga-cat-row"
                  style={{
                    background: openCat === c.id ? 'var(--navy)' : 'transparent',
                    color: openCat === c.id ? '#fff' : 'var(--ink)',
                  }}
                >
                  <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{c.emoji}</span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                  <span
                    className="ga-cat-count"
                    style={{
                      background: openCat === c.id ? 'rgba(255,255,255,.16)' : 'var(--navy-50)',
                      color: openCat === c.id ? '#dfe5f1' : 'var(--muted)',
                    }}
                  >
                    {c.business_count ?? 0}
                  </span>
                  <span style={{ fontSize: 10, color: openCat === c.id ? 'var(--gold)' : 'var(--muted)', transform: openCat === c.id ? 'rotate(90deg)' : 'none', transition: '.15s' }}>▶</span>
                </div>
                {openCat === c.id && svcs.length > 0 && (
                  <div style={{ padding: '4px 10px 8px 40px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <a href={`/kategori/${c.slug}`} style={{ fontSize: 12.5, color: 'var(--gold)', padding: '5px 8px', borderRadius: 7, fontWeight: 700 }}>
                      → Tüm {c.name}
                    </a>
                    {visibleSvcs.map((s) => (
                      <a
                        key={s.id}
                        href={`/kategori/${c.slug}?hizmet=${s.slug}`}
                        style={{ fontSize: 12.5, color: 'var(--muted)', padding: '5px 8px', borderRadius: 7, fontWeight: 500 }}
                      >
                        {s.name}
                      </a>
                    ))}
                    {svcs.length > SERVICE_LIMIT && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleSvcExpand(c.id); }}
                        style={{ fontSize: 12, color: 'var(--navy)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '5px 8px' }}
                      >
                        {isExpanded ? '− Daha az göster' : `+ ${svcs.length - SERVICE_LIMIT} hizmet daha`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ADRES KUTUSU */}
      <div className="ga-box">
        <div className="ga-box-h ga-box-h-toggle" onClick={() => setMobileLocOpen(!mobileLocOpen)}>
          <span><span style={{ color: 'var(--gold)' }}>📍</span> Konuma Göre Ara</span>
          <span className="ga-mobile-caret">{mobileLocOpen ? '▴' : '▾'}</span>
        </div>
        <div className={`ga-box-body ${mobileLocOpen ? 'mob-open' : ''}`} style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* İl */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="ga-ss-btn"
              onClick={() => { setOpenSS(openSS === 'city' ? null : 'city'); setQ(''); }}
            >
              <span style={{ color: city ? 'var(--ink)' : '#9aa1b2' }}>{city ? city.name : 'İl seçin…'}</span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>▾</span>
            </button>
            {openSS === 'city' && (
              <div className="ga-ss-pop">
                <input autoFocus className="ga-ss-search" placeholder="İl ara… (örn. ist)" value={q} onChange={(e) => setQ(e.target.value)} />
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {filteredCities.length ? filteredCities.map((p) => (
                    <div key={p.id} className="ga-ss-item" onClick={() => pickCity(p)}>{p.name}</div>
                  )) : <div style={{ padding: 12, textAlign: 'center', color: 'var(--muted)', fontSize: 12.5 }}>Sonuç yok</div>}
                </div>
              </div>
            )}
          </div>

          {/* İlçe */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="ga-ss-btn"
              disabled={!city}
              onClick={() => { setOpenSS(openSS === 'dist' ? null : 'dist'); setQ(''); }}
              style={{ background: !city ? '#f7f8fa' : '#fff', color: !city ? '#aab1c2' : 'var(--ink)', cursor: !city ? 'not-allowed' : 'pointer' }}
            >
              <span style={{ color: district ? 'var(--ink)' : '#9aa1b2' }}>{district ? district.name : (city ? 'İlçe seçin…' : 'Önce il seçin')}</span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>▾</span>
            </button>
            {openSS === 'dist' && city && (
              <div className="ga-ss-pop">
                <input autoFocus className="ga-ss-search" placeholder="İlçe ara…" value={q} onChange={(e) => setQ(e.target.value)} />
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {filteredDists.length ? filteredDists.map((d) => (
                    <div key={d.id} className="ga-ss-item" onClick={() => { setDistrict(d); setOpenSS(null); setQ(''); }}>{d.name}</div>
                  )) : <div style={{ padding: 12, textAlign: 'center', color: 'var(--muted)', fontSize: 12.5 }}>Bu il için ilçe verisi yakında</div>}
                </div>
              </div>
            )}
          </div>

          <button type="button" onClick={doSearch} disabled={!city} className="ga-search-btn" style={{ opacity: city ? 1 : 0.5, cursor: city ? 'pointer' : 'not-allowed' }}>
            Ara
          </button>
        </div>
      </div>
    </aside>
  );
}
