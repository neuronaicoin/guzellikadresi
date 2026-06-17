'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Prov = { id: number; name: string; slug: string };
type Dist = { id: number; name: string; slug: string };
type Cat = { id: number; name: string; slug: string; emoji: string | null };

export default function YakinimdaClient({ provinces, categories }: { provinces: Prov[]; categories: Cat[] }) {
  const router = useRouter();

  // Adım: 1=il, 2=ilçe, 3=kategori
  const [step, setStep] = useState(1);
  const [il, setIl] = useState<Prov | null>(null);
  const [ilce, setIlce] = useState<Dist | null>(null);
  const [districts, setDistricts] = useState<Dist[]>([]);
  const [ilQuery, setIlQuery] = useState('');
  const [ilceQuery, setIlceQuery] = useState('');
  const [geoStatus, setGeoStatus] = useState<'loading' | 'done'>('loading');

  // Açılışta IP'den il tahmini
  useEffect(() => {
    let done = false;
    fetch('/api/geo', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (done) return;
        if (d.ok && d.ilSlug) {
          const match = provinces.find((p) => p.slug === d.ilSlug);
          if (match) { chooseIl(match); setGeoStatus('done'); return; }
        }
        setGeoStatus('done');
      })
      .catch(() => { if (!done) setGeoStatus('done'); });
    return () => { done = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadDistricts(provId: number) {
    fetch(`/api/districts?province=${provId}`)
      .then((r) => r.json())
      .then((d) => setDistricts(d.districts || d || []))
      .catch(() => setDistricts([]));
  }

  function chooseIl(p: Prov) {
    setIl(p);
    setIlce(null);
    loadDistricts(p.id);
    setStep(2);
  }
  function chooseIlce(d: Dist) {
    setIlce(d);
    setStep(3);
  }
  function chooseCat(c: Cat) {
    if (il && ilce) router.push(`/${il.slug}/${ilce.slug}/${c.slug}`);
  }

  const norm = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/i̇/g, 'i');
  const ilList = ilQuery ? provinces.filter((p) => norm(p.name).includes(norm(ilQuery))) : provinces;
  const ilceList = ilceQuery ? districts.filter((d) => norm(d.name).includes(norm(ilceQuery))) : districts;

  const popularIl = ['istanbul', 'ankara', 'izmir', 'antalya', 'bursa'];

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', fontSize: 14, border: '2px solid var(--gold)', borderRadius: 12, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 12 };
  const chipBtn: React.CSSProperties = { display: 'block', width: '100%', textAlign: 'left', padding: '13px 14px', background: '#fff', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'var(--navy)', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 };

  return (
    <div style={{ padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
      {/* Adım göstergesi */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ flex: 1, height: 5, borderRadius: 3, background: step >= s ? 'var(--gold)' : 'var(--line)' }} />
        ))}
      </div>

      {/* Geri + seçim özeti */}
      {step > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => setStep(step - 1)}
            style={{ background: 'none', border: 'none', color: 'var(--navy)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            ‹ Geri
          </button>
          <div style={{ fontSize: 13, color: '#778' }}>
            {il && <b style={{ color: 'var(--navy)' }}>{il.name}</b>}
            {ilce && <> / <b style={{ color: 'var(--navy)' }}>{ilce.name}</b></>}
          </div>
        </div>
      )}

      {/* ADIM 1: İL */}
      {step === 1 && (
        <>
          <div style={{ background: 'var(--gold)', color: 'var(--navy)', padding: '12px 14px', borderRadius: 12, fontWeight: 800, fontSize: 15, marginBottom: 12, textAlign: 'center' }}>
            📍 1. Bölgeni seç
          </div>
          {geoStatus === 'loading' && (
            <p style={{ fontSize: 13, color: '#778', textAlign: 'center', marginBottom: 12 }}>Konumun belirleniyor…</p>
          )}
          <input placeholder="İl ara… (örn. Ordu)" value={ilQuery} onChange={(e) => setIlQuery(e.target.value)} style={inputStyle} />
          {!ilQuery && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {popularIl.map((slug) => {
                const p = provinces.find((x) => x.slug === slug);
                if (!p) return null;
                return (
                  <button key={slug} onClick={() => chooseIl(p)}
                    style={{ background: '#fff', border: '1.5px solid var(--gold)', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 700, color: 'var(--navy)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {p.name}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {ilList.map((p) => (
              <button key={p.id} onClick={() => chooseIl(p)} style={chipBtn}>{p.name}</button>
            ))}
          </div>
        </>
      )}

      {/* ADIM 2: İLÇE */}
      {step === 2 && (
        <>
          <div style={{ background: 'var(--gold)', color: 'var(--navy)', padding: '12px 14px', borderRadius: 12, fontWeight: 800, fontSize: 15, marginBottom: 12, textAlign: 'center' }}>
            📍 2. İlçeni seç
          </div>
          <input placeholder="İlçe ara…" value={ilceQuery} onChange={(e) => setIlceQuery(e.target.value)} style={inputStyle} />
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {ilceList.length === 0 && <p style={{ fontSize: 13, color: '#889', textAlign: 'center', padding: 20 }}>İlçeler yükleniyor…</p>}
            {ilceList.map((d) => (
              <button key={d.id} onClick={() => chooseIlce(d)} style={chipBtn}>{d.name}</button>
            ))}
          </div>
        </>
      )}

      {/* ADIM 3: KATEGORİ */}
      {step === 3 && (
        <>
          <div style={{ background: 'var(--gold)', color: 'var(--navy)', padding: '12px 14px', borderRadius: 12, fontWeight: 800, fontSize: 15, marginBottom: 12, textAlign: 'center' }}>
            ✨ 3. Hangi hizmet?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {categories.map((c) => (
              <button key={c.id} onClick={() => chooseCat(c)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid var(--gold)', borderRadius: 12, padding: '14px 12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ fontSize: 22 }}>{c.emoji}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>{c.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
