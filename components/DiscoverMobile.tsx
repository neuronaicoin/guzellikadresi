'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Province } from '@/lib/types';

type Cat = { id: number; name: string; slug: string; emoji: string | null };
type District = { id: number; name: string; slug: string };

const POPULAR = ['istanbul', 'ankara', 'izmir', 'antalya', 'bursa'];

export default function DiscoverMobile({
  categories,
  provinces,
}: {
  categories: Cat[];
  provinces: Province[];
}) {
  const router = useRouter();

  const [ilSlug, setIlSlug] = useState('');
  const [ilName, setIlName] = useState('');
  const [ilceSlug, setIlceSlug] = useState('');
  const [ilceName, setIlceName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catName, setCatName] = useState('');

  const [step, setStep] = useState(1);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDist, setLoadingDist] = useState(false);

  // Dolu ilçe/kategori sayıları
  const [coverDist, setCoverDist] = useState<Record<string, number>>({});
  const [coverCat, setCoverCat] = useState<Record<string, number>>({});

  // Arama kutuları
  const [ilQuery, setIlQuery] = useState('');
  const [ilceQuery, setIlceQuery] = useState('');

  // IP'den tespit edilen il
  const [detectedIl, setDetectedIl] = useState<Province | null>(null);

  useEffect(() => {
    let saved = '';
    try { saved = localStorage.getItem('ga_il') || ''; } catch {}
    const slug = saved;
    fetch('/api/geo')
      .then((r) => r.json())
      .then((d) => {
        const useSlug = slug || (d.ok ? d.ilSlug : '');
        if (useSlug) {
          const p = provinces.find((x) => x.slug === useSlug);
          if (p) setDetectedIl(p);
        }
      })
      .catch(() => {});
  }, [provinces]);

  // Türkçe duyarsız arama
  const norm = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/[ıi̇]/g, 'i');

  const filteredProvinces = useMemo(() => {
    if (!ilQuery.trim()) return provinces;
    const q = norm(ilQuery);
    return provinces.filter((p) => norm(p.name).includes(q));
  }, [ilQuery, provinces]);

  const filteredDistricts = useMemo(() => {
    if (!ilceQuery.trim()) return districts;
    const q = norm(ilceQuery);
    return districts.filter((d) => norm(d.name).includes(q));
  }, [ilceQuery, districts]);

  async function chooseIl(p: Province) {
    setIlSlug(p.slug); setIlName(p.name);
    setIlceSlug(''); setIlceName(''); setCatSlug(''); setCatName('');
    setIlceQuery('');
    try { localStorage.setItem('ga_il', p.slug); } catch {}
    setStep(2);
    setLoadingDist(true);
    // ilçeler + kapsama bilgisi paralel
    try {
      const [dr, cr] = await Promise.all([
        fetch(`/api/districts?province=${p.id}`).then((r) => r.json()),
        fetch(`/api/coverage?province=${p.id}`).then((r) => r.json()),
      ]);
      setDistricts(dr.districts || []);
      setCoverDist(cr.districts || {});
      setCoverCat(cr.categories || {});
    } catch {
      setDistricts([]);
    } finally {
      setLoadingDist(false);
    }
  }

  function chooseIlce(d: District) {
    setIlceSlug(d.slug); setIlceName(d.name);
    setCatSlug(''); setCatName('');
    setStep(3);
  }

  function chooseCat(c: Cat) {
    setCatSlug(c.slug); setCatName(c.name);
    setStep(4);
  }

  function doSearch() {
    if (ilSlug && ilceSlug && catSlug) router.push(`/${ilSlug}/${ilceSlug}/${catSlug}`);
  }

  function reset() {
    setStep(1); setIlSlug(''); setIlName(''); setIlceSlug(''); setIlceName('');
    setCatSlug(''); setCatName(''); setIlQuery(''); setIlceQuery('');
  }

  // Adım göstergesi
  const steps = [
    { n: 1, label: 'İl' },
    { n: 2, label: 'İlçe' },
    { n: 3, label: 'Hizmet' },
    { n: 4, label: 'Ara' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 10,
    fontSize: 14, marginBottom: 10, outline: 'none',
  };
  const backBtn = (
    <button onClick={() => setStep(step - 1)}
      style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '2px 0', marginBottom: 6 }}>
      ‹ Geri
    </button>
  );

  // Popüler iller (listenin başında)
  const popularProvs = POPULAR.map((s) => provinces.find((p) => p.slug === s)).filter(Boolean) as Province[];

  return (
    <div className="ga-discover">
      {/* Adım göstergesi */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: 4, borderRadius: 4,
              background: step >= s.n ? 'var(--gold)' : '#e3e6ee',
              marginBottom: 5, transition: '.2s',
            }} />
            <span style={{ fontSize: 10.5, fontWeight: step === s.n ? 800 : 600, color: step >= s.n ? 'var(--navy)' : '#aab' }}>
              {s.n}. {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Seçim özeti */}
      {(ilName || step > 1) && (
        <div className="ga-disc-loc" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 13 }}>📍 <b>{ilName || '—'}</b>{ilceName ? ` › ${ilceName}` : ''}{catName ? ` › ${catName}` : ''}</span>
          <button onClick={reset}>Sıfırla</button>
        </div>
      )}

      {/* ADIM 1: İL */}
      {step === 1 && (
        <>
          <div style={{ background: 'var(--gold)', color: 'var(--navy)', padding: '12px 14px', borderRadius: 12, fontWeight: 800, fontSize: 15, marginBottom: 12, textAlign: 'center' }}>
            📍 Önce bölgeni seç
          </div>
          {detectedIl && (
            <button onClick={() => chooseIl(detectedIl)}
              style={{ width: '100%', padding: '12px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              📍 Bulunduğunuz il: {detectedIl.name} — Seç
            </button>
          )}
          <input
            placeholder="İl ara… (örn. Ordu)"
            value={ilQuery}
            onChange={(e) => setIlQuery(e.target.value)}
            style={{ ...inputStyle, border: '2px solid var(--gold)', borderRadius: 12 }}
          />
          {!ilQuery && popularProvs.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: '#999', margin: '2px 0 6px' }}>Popüler</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {popularProvs.map((p) => (
                  <button key={p.id} onClick={() => chooseIl(p)}
                    style={{ padding: '7px 12px', background: '#f0f2f7', border: '1px solid #e3e6ee', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--navy)' }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="ga-disc-citylist">
            {filteredProvinces.map((p) => (
              <button key={p.id} onClick={() => chooseIl(p)}>{p.name}</button>
            ))}
            {filteredProvinces.length === 0 && <p style={{ fontSize: 13, color: '#999', padding: 8 }}>İl bulunamadı.</p>}
          </div>
        </>
      )}

      {/* ADIM 2: İLÇE */}
      {step === 2 && (
        <>
          {backBtn}
          <div className="ga-disc-cats-title">{ilName} › İlçe seçin</div>
          {loadingDist ? (
            <p style={{ fontSize: 13, color: '#888', padding: '8px 0' }}>İlçeler yükleniyor…</p>
          ) : (
            <>
              <input
                placeholder="İlçe ara…"
                value={ilceQuery}
                onChange={(e) => setIlceQuery(e.target.value)}
                style={inputStyle}
              />
              <div className="ga-disc-citylist">
                {filteredDistricts.map((d) => {
                  const cnt = coverDist[d.slug] || 0;
                  return (
                    <button key={d.id} onClick={() => chooseIlce(d)}>
                      {d.name}{cnt > 0 && <span style={{ color: 'var(--gold)', fontWeight: 800, marginLeft: 4 }}> • {cnt}</span>}
                    </button>
                  );
                })}
                {filteredDistricts.length === 0 && <p style={{ fontSize: 13, color: '#999', padding: 8 }}>İlçe bulunamadı.</p>}
              </div>
            </>
          )}
        </>
      )}

      {/* ADIM 3: KATEGORİ */}
      {step === 3 && (
        <>
          {backBtn}
          <div className="ga-disc-cats-title">{ilceName} › Hizmet seçin</div>
          <div className="ga-disc-cats">
            {categories.map((c) => {
              const cnt = coverCat[c.slug] || 0;
              return (
                <button key={c.id} className="ga-disc-cat" onClick={() => chooseCat(c)}
                  style={cnt > 0 ? { borderColor: 'var(--gold)' } : undefined}>
                  <span className="ga-disc-cat-emoji">{c.emoji}</span>
                  <span className="ga-disc-cat-name">{c.name}{cnt > 0 && <b style={{ color: 'var(--gold)' }}> •</b>}</span>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 8 }}>• = bu ilde işletmesi olan hizmetler</p>
        </>
      )}

      {/* ADIM 4: ARA */}
      {step === 4 && (
        <>
          {backBtn}
          <div style={{ padding: '14px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>
              <b>{ilceName}</b>&apos;de <b>{catName}</b>
            </p>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>aramaya hazır</p>
            <button className="ga-disc-cta" onClick={doSearch} style={{ width: '100%' }}>
              🔍 {ilceName}&apos;de {catName} ara →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
