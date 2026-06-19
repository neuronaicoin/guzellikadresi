'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Prov = { id: number; name: string; slug: string };
type Dist = { id: number; name: string; slug: string };
type Service = { id: number; name: string; slug: string };
type Cat = { id: number; name: string; slug: string; emoji?: string; services?: Service[] };

export default function SearchPanel({
  provinces,
  categories = [],
}: {
  provinces: Prov[];
  categories?: Cat[];
}) {
  const router = useRouter();

  // Akış adımı: 1=il, 2=ilçe, 3=kategori, 4=hizmet
  const [step, setStep] = useState(1);
  const [prov, setProv] = useState<Prov | null>(null);
  const [dist, setDist] = useState<Dist | null>(null);
  const [districts, setDistricts] = useState<Dist[]>([]);
  const [cat, setCat] = useState<Cat | null>(null);
  const [q, setQ] = useState('');

  // İl seçilince ilçeleri getir
  useEffect(() => {
    if (!prov) { setDistricts([]); return; }
    fetch(`/api/districts?province=${prov.id}`)
      .then((r) => r.json())
      .then((d) => setDistricts(d.districts || d || []))
      .catch(() => setDistricts([]));
  }, [prov]);

  function goSearch(extraTerm?: string) {
    const sp = new URLSearchParams();
    const term = (extraTerm ?? q).trim();
    if (term) sp.set('q', term);
    if (prov) sp.set('il', String(prov.id));
    if (dist) sp.set('ilce', String(dist.id));
    router.push(`/ara?${sp.toString()}`);
  }

  // ---- ortak stiller ----
  const boxBtn: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '15px 16px', background: '#fff', border: '2px solid var(--gold)',
    borderRadius: 12, fontSize: 15, fontWeight: 700, color: 'var(--navy)',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
  };
  const backBtn: React.CSSProperties = {
    background: 'none', border: 'none', color: 'var(--navy)', fontWeight: 700,
    fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', padding: 0, marginBottom: 14,
  };
  const stepLabel: React.CSSProperties = {
    background: 'var(--gold)', color: 'var(--navy)', padding: '12px 14px',
    borderRadius: 12, fontWeight: 800, fontSize: 15, marginBottom: 14, textAlign: 'center',
  };

  return (
    <div className="ga-searchpanel" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px' }}>
        Ne arıyorsun?
      </h1>
      <p style={{ fontSize: 14, color: '#778', margin: '0 0 18px' }}>
        Adım adım seç, sana en yakın işletmeleri bulalım.
      </p>

      {/* Geri tuşu (1. adımdan sonra) */}
      {step > 1 && (
        <button onClick={() => setStep(step - 1)} style={backBtn}>‹ Geri</button>
      )}

      {/* Seçim özeti */}
      {(prov || cat) && (
        <div style={{ fontSize: 13, color: '#778', marginBottom: 12 }}>
          {prov && <b style={{ color: 'var(--navy)' }}>{prov.name}</b>}
          {dist && <> / <b style={{ color: 'var(--navy)' }}>{dist.name}</b></>}
          {cat && <> / <b style={{ color: 'var(--navy)' }}>{cat.name}</b></>}
        </div>
      )}

      {/* ADIM 1: İL */}
      {step === 1 && (
        <div>
          <div style={stepLabel}>📍 1. İl seç</div>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {provinces.map((p) => (
              <button key={p.id} style={boxBtn}
                onClick={() => { setProv(p); setDist(null); setStep(2); }}>
                {p.name}
              </button>
            ))}
          </div>
          {/* İl seçmeden direkt aramak isteyen için */}
          <button onClick={() => goSearch()} style={{ ...backBtn, marginTop: 4, color: '#99a' }}>
            İl seçmeden tümünü gör →
          </button>
        </div>
      )}

      {/* ADIM 2: İLÇE */}
      {step === 2 && (
        <div>
          <div style={stepLabel}>🏘️ 2. İlçe seç — {prov?.name}</div>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            <button style={{ ...boxBtn, borderStyle: 'dashed' }}
              onClick={() => { setDist(null); setStep(3); }}>
              Tüm {prov?.name} (ilçe farketmez)
            </button>
            {districts.map((d) => (
              <button key={d.id} style={boxBtn}
                onClick={() => { setDist(d); setStep(3); }}>
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ADIM 3: KATEGORİ */}
      {step === 3 && (
        <div>
          <div style={stepLabel}>✦ 3. Kategori seç</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {categories.map((c) => (
              <button key={c.id}
                onClick={() => {
                  setCat(c);
                  if (c.services && c.services.length > 0) setStep(4);
                  else goSearch(c.name);
                }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '16px 10px', background: '#fff', border: '2px solid var(--gold)',
                  borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                <span style={{ fontSize: 26 }}>{c.emoji || '✦'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', textAlign: 'center' }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ADIM 4: HİZMET */}
      {step === 4 && cat && (
        <div>
          <div style={stepLabel}>🔎 4. {cat.name} — hizmet seç</div>
          <button style={{ ...boxBtn, borderStyle: 'dashed' }}
            onClick={() => goSearch(cat.name)}>
            Tüm {cat.name} işletmeleri →
          </button>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {(cat.services || []).map((s) => (
              <button key={s.id} style={boxBtn} onClick={() => goSearch(s.name)}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Her zaman görünür: serbest arama + Ara tuşu */}
      <div style={{ marginTop: 22, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>
          Ya da serbest ara:
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') goSearch(); }}
            placeholder="örn. lazer, kuaför, botoks…"
            style={{ flex: 1, padding: '13px 14px', fontSize: 15, border: '2px solid var(--gold)', borderRadius: 12, fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
          <button onClick={() => goSearch()}
            style={{ padding: '13px 22px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            🔍 Ara
          </button>
        </div>
      </div>
    </div>
  );
}
