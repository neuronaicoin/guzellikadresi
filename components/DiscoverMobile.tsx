'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Province } from '@/lib/types';

type Cat = { id: number; name: string; slug: string; emoji: string | null };
type District = { id: number; name: string; slug: string };

export default function DiscoverMobile({
  categories,
  provinces,
}: {
  categories: Cat[];
  provinces: Province[];
}) {
  const router = useRouter();

  // Seçimler
  const [ilSlug, setIlSlug] = useState('');
  const [ilName, setIlName] = useState('');
  const [ilId, setIlId] = useState<number | null>(null);
  const [ilceSlug, setIlceSlug] = useState('');
  const [ilceName, setIlceName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catName, setCatName] = useState('');

  // Adım: 1=il, 2=ilçe, 3=kategori, 4=ara
  const [step, setStep] = useState(1);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // İlk açılışta IP'den il tespit (sadece öneri olarak, otomatik geçiş yapmaz)
  const [suggestedIl, setSuggestedIl] = useState('');
  useEffect(() => {
    let saved = '';
    try { saved = localStorage.getItem('ga_il') || ''; } catch {}
    const init = saved;
    if (init) {
      const p = provinces.find((x) => x.slug === init);
      if (p) { setSuggestedIl(p.name); }
    }
    fetch('/api/geo')
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.ilSlug && !init) {
          const p = provinces.find((x) => x.slug === d.ilSlug);
          if (p) setSuggestedIl(p.name);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [provinces]);

  // İl seçilince ilçeleri çek
  async function chooseIl(p: Province) {
    setIlSlug(p.slug); setIlName(p.name); setIlId(p.id);
    setIlceSlug(''); setIlceName(''); setCatSlug(''); setCatName('');
    try { localStorage.setItem('ga_il', p.slug); } catch {}
    setStep(2);
    setLoadingDist(true);
    try {
      const r = await fetch(`/api/districts?province=${p.id}`);
      const d = await r.json();
      setDistricts(d.districts || []);
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
    if (ilSlug && ilceSlug && catSlug) {
      router.push(`/${ilSlug}/${ilceSlug}/${catSlug}`);
    }
  }

  const back = (
    <button className="ga-disc-back" onClick={() => setStep(step - 1)}
      style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginBottom: 8 }}>
      ‹ Geri
    </button>
  );

  return (
    <div className="ga-discover">
      {/* Seçim özeti şeridi */}
      <div className="ga-disc-loc">
        <span>📍 {' '}
          {ilName ? <b>{ilName}{ilceName ? ` › ${ilceName}` : ''}{catName ? ` › ${catName}` : ''}</b>
            : (loaded ? (suggestedIl ? `Öneri: ${suggestedIl}` : 'İl seçin') : 'Konum bulunuyor…')}
        </span>
        {step > 1 && (
          <button onClick={() => { setStep(1); setIlSlug(''); setIlName(''); setIlceSlug(''); setIlceName(''); setCatSlug(''); setCatName(''); }}>
            Sıfırla
          </button>
        )}
      </div>

      {/* ADIM 1: İL */}
      {step === 1 && (
        <>
          <div className="ga-disc-cats-title">İl seçin</div>
          <div className="ga-disc-citylist">
            {provinces.map((p) => (
              <button key={p.id} onClick={() => chooseIl(p)}>{p.name}</button>
            ))}
          </div>
        </>
      )}

      {/* ADIM 2: İLÇE */}
      {step === 2 && (
        <>
          {back}
          <div className="ga-disc-cats-title">{ilName} › İlçe seçin</div>
          {loadingDist ? (
            <p style={{ fontSize: 13, color: '#888', padding: '8px 0' }}>İlçeler yükleniyor…</p>
          ) : (
            <div className="ga-disc-citylist">
              {districts.map((d) => (
                <button key={d.id} onClick={() => chooseIlce(d)}>{d.name}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ADIM 3: KATEGORİ */}
      {step === 3 && (
        <>
          {back}
          <div className="ga-disc-cats-title">{ilceName} › Hizmet seçin</div>
          <div className="ga-disc-cats">
            {categories.map((c) => (
              <button key={c.id} className="ga-disc-cat" onClick={() => chooseCat(c)}>
                <span className="ga-disc-cat-emoji">{c.emoji}</span>
                <span className="ga-disc-cat-name">{c.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ADIM 4: ARA */}
      {step === 4 && (
        <>
          {back}
          <div style={{ padding: '12px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>
              <b>{ilceName}</b>'de <b>{catName}</b>
            </p>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>aramaya hazır</p>
            <button className="ga-disc-cta" onClick={doSearch} style={{ width: '100%' }}>
              🔍 {ilceName}'de {catName} ara →
            </button>
          </div>
        </>
      )}

      {/* Hızlı geçiş: İl seçiliyse "tüm işletmeleri gör" */}
      {step === 1 && suggestedIl && (
        <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 10 }}>
          İpucu: Önce il, sonra ilçe ve hizmet seçerek aratabilirsiniz.
        </p>
      )}
    </div>
  );
}
