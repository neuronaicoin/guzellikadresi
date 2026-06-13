'use client';

import { useState } from 'react';

type Svc = { id: number; name: string };
type Cat = { id: number; name: string; slug: string; emoji: string | null; services: Svc[] };
type Prov = { id: number; name: string; slug: string };
type Dist = { id: number; name: string; slug: string };

export default function RegisterForm({
  categories,
  provinces,
}: {
  categories: Cat[];
  provinces: Prov[];
}) {
  const [step, setStep] = useState(1);

  // form state
  const [name, setName] = useState('');
  const [catId, setCatId] = useState<number | null>(null);
  const [desc, setDesc] = useState('');
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
  const [showMore, setShowMore] = useState(false);

  // konum
  const [cityId, setCityId] = useState<number | null>(null);
  const [districts, setDistricts] = useState<Dist[]>([]);
  const [distId, setDistId] = useState<number | null>(null);
  const [hood, setHood] = useState('');
  const [addr, setAddr] = useState('');

  // iletişim
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [xTwitter, setXTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [done, setDone] = useState(false);

  const selectedCat = categories.find((c) => c.id === catId) || null;

  async function pickCity(id: number) {
    setCityId(id);
    setDistId(null);
    setDistricts([]);
    try {
      const res = await fetch(`/api/districts?province=${id}`);
      const data = await res.json();
      setDistricts(data.districts || []);
    } catch {
      setDistricts([]);
    }
  }

  function toggleService(id: number) {
    const next = new Set(selectedServices);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedServices(next);
  }

  function onPickCategory(id: number) {
    setCatId(id);
    setSelectedServices(new Set()); // kategori değişince hizmetleri sıfırla
    setShowMore(false);
  }

  function next() { if (step < 4) setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function back() { if (step > 1) setStep(step - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function submit() {
    // PARÇA 1: sadece arayüz. Kayıt Parça 3'te eklenecek.
    setDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (done) {
    return (
      <div className="ga-reg-done">
        <div className="ga-reg-check">✓</div>
        <h2>Başvurun alındı!</h2>
        <p>İşletmen incelendikten sonra (genelde 24 saat içinde) yayına alınacak.</p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10 }}>
          (Not: Şu an form kaydı henüz aktif değil — bu bir önizlemedir. Kayıt işlevi sonraki adımda eklenecek.)
        </p>
      </div>
    );
  }

  return (
    <div className="ga-reg">
      {/* STEPPER */}
      <div className="ga-stepper">
        {[
          { n: 1, t: 'İşletme', s: 'Bilgi & hizmetler' },
          { n: 2, t: 'Fotoğraflar', s: 'Görseller' },
          { n: 3, t: 'Konum', s: 'Adres' },
          { n: 4, t: 'İletişim', s: 'Son adım' },
        ].map((s) => (
          <div
            key={s.n}
            className={`ga-step ${step === s.n ? 'active' : ''} ${step > s.n ? 'done' : ''}`}
            onClick={() => setStep(s.n)}
          >
            <span className="ga-step-num">{step > s.n ? '✓' : s.n}</span>
            <span className="ga-step-lbl">{s.t}<small>{s.s}</small></span>
          </div>
        ))}
      </div>

      <div className="ga-reg-card">
        {/* ADIM 1 */}
        {step === 1 && (
          <div className="ga-reg-body">
            <div className="ga-reg-head"><span className="ga-reg-tag">🏠</span><div><h3>İşletme Bilgileri</h3><p>Müşterilerin sizi nasıl göreceğinin temeli</p></div></div>

            <div className="ga-field">
              <label>İşletme adı <span className="req">*</span></label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Lumière Güzellik Merkezi" />
            </div>

            <div className="ga-field">
              <label>İşletme kategorisi <span className="req">*</span></label>
              <select value={catId ?? ''} onChange={(e) => onPickCategory(Number(e.target.value))}>
                <option value="">Kategori seçin…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {selectedCat && (
              <div className="ga-field">
                <label>Verdiğiniz hizmetler <span className="req">*</span></label>
                <div className="ga-svc-note"><b>{selectedCat.name}</b> hizmetlerinden sunduklarınızı işaretleyin. Profilde fiyat gösterilmez.</div>
                <div className="ga-chips">
                  {selectedCat.services.map((s) => (
                    <span key={s.id} className={`ga-chip ${selectedServices.has(s.id) ? 'sel' : ''}`} onClick={() => toggleService(s.id)}>{s.name}</span>
                  ))}
                </div>
                <button type="button" className="ga-addmore" onClick={() => setShowMore(!showMore)}>
                  {showMore ? '− Diğer kategorileri gizle' : '+ Başka kategoriden hizmet ekle'}
                </button>
                {showMore && (
                  <div style={{ marginTop: 14 }}>
                    {categories.filter((c) => c.id !== catId).map((c) => (
                      <div key={c.id} style={{ marginBottom: 14 }}>
                        <div className="ga-more-cat">{c.emoji} {c.name}</div>
                        <div className="ga-chips">
                          {c.services.map((s) => (
                            <span key={s.id} className={`ga-chip ${selectedServices.has(s.id) ? 'sel' : ''}`} onClick={() => toggleService(s.id)}>{s.name}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="ga-field">
              <label>Kısa açıklama <span className="req">*</span></label>
              <textarea value={desc} maxLength={300} onChange={(e) => setDesc(e.target.value)} placeholder="İşletmenizi kısaca açıklayınız…" />
              <div className="ga-counter">{desc.length}/300</div>
            </div>
          </div>
        )}

        {/* ADIM 2 — FOTOĞRAFLAR (Parça 2'de aktif olacak) */}
        {step === 2 && (
          <div className="ga-reg-body">
            <div className="ga-reg-head"><span className="ga-reg-tag">📷</span><div><h3>İşletme Fotoğrafları</h3><p>Mekânınızı ve örnek işlerinizi gösterin</p></div></div>
            <div className="ga-field">
              <label>Mekân fotoğrafları <span className="req">*</span></label>
              <div className="ga-drop">
                <div style={{ fontSize: 26 }}>🏢</div>
                <b>Fotoğraf ekleme (yakında)</b>
                <span>Fotoğraf yükleme ve otomatik optimizasyon sonraki adımda eklenecek</span>
              </div>
            </div>
            <div className="ga-field">
              <label>Örnek çalışmalar <span className="opt">(opsiyonel)</span></label>
              <div className="ga-drop">
                <div style={{ fontSize: 26 }}>✨</div>
                <b>Örnek iş ekleme (yakında)</b>
                <span>Önce/sonra çalışmalarınız</span>
              </div>
            </div>
          </div>
        )}

        {/* ADIM 3 — KONUM */}
        {step === 3 && (
          <div className="ga-reg-body">
            <div className="ga-reg-head"><span className="ga-reg-tag">📍</span><div><h3>Konum</h3><p>Müşterileriniz size kolayca ulaşsın</p></div></div>
            <div className="ga-grid2">
              <div className="ga-field">
                <label>İl <span className="req">*</span></label>
                <select value={cityId ?? ''} onChange={(e) => pickCity(Number(e.target.value))}>
                  <option value="">İl seçin…</option>
                  {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="ga-field">
                <label>İlçe <span className="req">*</span></label>
                <select value={distId ?? ''} onChange={(e) => setDistId(Number(e.target.value))} disabled={!cityId}>
                  <option value="">{cityId ? 'İlçe seçin…' : 'Önce il seçin'}</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="ga-field">
              <label>Mahalle <span className="opt">(opsiyonel)</span></label>
              <input value={hood} onChange={(e) => setHood(e.target.value)} placeholder="Mahalle adı" />
            </div>
            <div className="ga-field">
              <label>Cadde / Sokak <span className="req">*</span></label>
              <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Cadde veya sokak adı" />
            </div>
            <div className="ga-map-ph">📍 Harita (yakında) — tam konum pini sonraki adımda</div>
          </div>
        )}

        {/* ADIM 4 — İLETİŞİM */}
        {step === 4 && (
          <div className="ga-reg-body">
            <div className="ga-reg-head"><span className="ga-reg-tag">📞</span><div><h3>İletişim Bilgileri</h3><p>Müşteriler bu kanallardan size ulaşacak</p></div></div>
            <div className="ga-grid2">
              <div className="ga-field"><label>Telefon <span className="req">*</span></label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0 5XX XXX XX XX" /></div>
              <div className="ga-field"><label>WhatsApp <span className="opt">(opsiyonel)</span></label><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="0 5XX XXX XX XX" /></div>
            </div>
            <div className="ga-grid2">
              <div className="ga-field"><label>Web sitesi <span className="opt">(opsiyonel)</span></label><input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" /></div>
              <div className="ga-field"><label>Instagram <span className="opt">(opsiyonel)</span></label><input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@kullaniciadi" /></div>
            </div>
            <div className="ga-grid2">
              <div className="ga-field"><label>Facebook <span className="opt">(opsiyonel)</span></label><input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="facebook.com/…" /></div>
              <div className="ga-field"><label>X (Twitter) <span className="opt">(opsiyonel)</span></label><input value={xTwitter} onChange={(e) => setXTwitter(e.target.value)} placeholder="@kullaniciadi" /></div>
            </div>
            <div className="ga-field"><label>LinkedIn <span className="opt">(opsiyonel)</span></label><input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/company/…" /></div>
            <div className="ga-tip">✦ Bilgileriniz incelendikten sonra (genelde 24 saat) yayına alınır. Kayıt ve listelenme tamamen ücretsizdir.</div>
          </div>
        )}

        {/* NAV */}
        <div className="ga-reg-nav">
          {step > 1 && <button type="button" className="ga-btn-back" onClick={back}>← Geri</button>}
          {step < 4 && <button type="button" className="ga-btn-next" onClick={next}>Devam et →</button>}
          {step === 4 && <button type="button" className="ga-btn-submit" onClick={submit}>Başvuruyu gönder ✓</button>}
        </div>
      </div>
    </div>
  );
}
