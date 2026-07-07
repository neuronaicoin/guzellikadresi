'use client';

import { useState } from 'react';
import { optimizeImage } from '@/lib/imageOptimize';
import { CITY_COORDS, TURKEY_CENTER } from '@/lib/cityCoords';
import { useAuth } from '@/lib/useAuth';
import { supabaseAuth } from '@/lib/supabase-auth';
import { trackGA } from '@/lib/track';
import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false });

type Svc = { id: number; name: string };
type Cat = { id: number; name: string; slug: string; emoji: string | null; services: Svc[] };
type Prov = { id: number; name: string; slug: string };
type Dist = { id: number; name: string; slug: string };
type Photo = { url: string; blob: Blob; kind: 'gallery' | 'work' };

export default function RegisterForm({
  categories,
  provinces,
}: {
  categories: Cat[];
  provinces: Prov[];
}) {
  const { user, loading: authLoading } = useAuth();
  // Giriş yapmamışsa hesap adımı gerekir
  const needsAccount = !user;

  // step: 0 = hesap (sadece needsAccount ise), 1-4 = mevcut adımlar
  const [step, setStep] = useState(0);

  // Hesap alanları
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  const [name, setName] = useState('');
  const [catId, setCatId] = useState<number | null>(null);
  const [desc, setDesc] = useState('');
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
  const [showMore, setShowMore] = useState(false);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [works, setWorks] = useState<Photo[]>([]);
  const [optimizing, setOptimizing] = useState(false);

  const [cityId, setCityId] = useState<number | null>(null);
  const [citySlug, setCitySlug] = useState<string>('');
  const [districts, setDistricts] = useState<Dist[]>([]);
  const [distId, setDistId] = useState<number | null>(null);
  const [hood, setHood] = useState('');
  const [addr, setAddr] = useState('');
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);

  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [xTwitter, setXTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const selectedCat = categories.find((c) => c.id === catId) || null;
  const mapCenter = citySlug && CITY_COORDS[citySlug] ? CITY_COORDS[citySlug] : TURKEY_CENTER;

  async function pickCity(id: number) {
    setCityId(id);
    const prov = provinces.find((p) => p.id === id);
    setCitySlug(prov?.slug || '');
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
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedServices(next);
  }

  function onPickCategory(id: number) {
    setCatId(id);
    setSelectedServices(new Set());
    setShowMore(false);
  }

  async function handleFiles(files: FileList | null, kind: 'gallery' | 'work') {
    if (!files || !files.length) return;
    const max = kind === 'work' ? 12 : 10;
    const current = kind === 'work' ? works : photos;
    setOptimizing(true);
    const added: Photo[] = [];
    for (const file of Array.from(files)) {
      if (current.length + added.length >= max) break;
      if (!file.type.startsWith('image/')) continue;
      try {
        const blob = await optimizeImage(file);
        added.push({ url: URL.createObjectURL(blob), blob, kind });
      } catch {}
    }
    if (kind === 'work') setWorks([...works, ...added]);
    else setPhotos([...photos, ...added]);
    setOptimizing(false);
  }

  function removePhoto(idx: number, kind: 'gallery' | 'work') {
    if (kind === 'work') setWorks(works.filter((_, i) => i !== idx));
    else setPhotos(photos.filter((_, i) => i !== idx));
  }

  // Giriş yapmış kullanıcı için hesap adımını atla (ilk adım 1)
  const minStep = needsAccount ? 0 : 1;
  const curStep = step < minStep ? minStep : step;

  function next() {
    // Hesap adımındaysa önce doğrula
    if (curStep === 0 && needsAccount) {
      if (!validateAccount()) return;
    }
    if (curStep < 4) setStep(curStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function back() {
    if (curStep > minStep) setStep(curStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateAccount(): boolean {
    if (needsAccount) {
      if (!email.trim()) { setErrMsg('E-posta adresi gerekli.'); setStep(0); return false; }
      if (pw.length < 6) { setErrMsg('Şifre en az 6 karakter olmalı.'); setStep(0); return false; }
      if (pw !== pw2) { setErrMsg('Şifreler eşleşmiyor.'); setStep(0); return false; }
    }
    return true;
  }

  async function submit() {
    setErrMsg('');
    // Hesap kontrolü (giriş yoksa)
    if (!validateAccount()) return;
    // Zorunlu alan kontrolü
    if (!name.trim()) { setErrMsg('İşletme adı gerekli.'); setStep(1); return; }
    if (!catId) { setErrMsg('Kategori seçin.'); setStep(1); return; }
    // Hizmet, açıklama, fotoğraf ve adres artık opsiyonel — sonradan panelden eklenebilir.
    if (!cityId || !distId) { setErrMsg('İl ve ilçe seçin.'); setStep(3); return; }
    if (!phone.trim()) { setErrMsg('Telefon gerekli.'); setStep(4); return; }

    setSending(true);
    try {
      // 1) Gerekiyorsa hesap oluştur ve giriş yap
      let ownerId: string | null = user?.id ?? null;
      if (needsAccount) {
        const { data: signUpData, error: signUpErr } = await supabaseAuth.auth.signUp({
          email: email.trim(),
          password: pw,
        });
        if (signUpErr) {
          const m = signUpErr.message.toLowerCase();
          if (m.includes('already') || m.includes('exists')) {
            setErrMsg('Bu e-posta zaten kayıtlı. Lütfen giriş yapıp işletme ekleyin veya farklı e-posta kullanın.');
          } else if (m.includes('password')) {
            setErrMsg('Şifre çok kısa (en az 6 karakter).');
          } else {
            setErrMsg('Hesap oluşturulamadı: ' + signUpErr.message);
          }
          setStep(0);
          setSending(false);
          return;
        }
        ownerId = signUpData.user?.id ?? null;
      }

      // 2) İşletmeyi kaydet
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', desc);
      fd.append('categoryId', String(catId));
      fd.append('provinceId', String(cityId));
      fd.append('districtId', String(distId));
      fd.append('neighborhood', hood);
      fd.append('address', addr);
      if (pin) { fd.append('lat', String(pin.lat)); fd.append('lng', String(pin.lng)); }
      fd.append('phone', phone);
      fd.append('whatsapp', whatsapp);
      fd.append('website', website);
      fd.append('instagram', instagram);
      fd.append('facebook', facebook);
      fd.append('x', xTwitter);
      fd.append('linkedin', linkedin);
      if (ownerId) fd.append('ownerId', ownerId);
      fd.append('serviceIds', JSON.stringify(Array.from(selectedServices)));
      photos.forEach((p, i) => fd.append('photos', new File([p.blob], `gallery-${i}.webp`, { type: 'image/webp' })));
      works.forEach((p, i) => fd.append('works', new File([p.blob], `work-${i}.webp`, { type: 'image/webp' })));

      const res = await fetch('/api/register', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.ok) {
        // GA: işletme ekleme tamamlandı (+ yeni hesap oluştuysa üye kaydı)
        trackGA('isletme_ekleme', { method: needsAccount ? 'yeni_hesap' : 'mevcut_hesap' });
        if (needsAccount) trackGA('uye_kaydi');
        // Meta Pixel: işletme kaydı tamamlandı (reklam dönüşüm takibi)
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'CompleteRegistration', {
            content_name: 'isletme_ekleme',
            status: needsAccount ? 'yeni_hesap' : 'mevcut_hesap',
          });
        }
        setDone(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrMsg(data.error || 'Kayıt sırasında hata oluştu.');
      }
    } catch {
      setErrMsg('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="ga-reg-done">
        <div className="ga-reg-check">✓</div>
        <h2>İşletmeniz eklendi!</h2>
        <p>İşletmeniz yayında. {needsAccount && 'Oluşturduğunuz e-posta ve şifre ile giriş yaparak işletmenizi yönetebilirsiniz.'}</p>

        {/* RANDEVU TEŞVİK KUTUSU */}
        <div className="ga-randevu-promo">
          <div className="ga-randevu-promo-icon">📅</div>
          <h3>Yeni: Online Randevu Sistemi</h3>
          <p>
            Panelinden <b>online randevu sistemini</b> aktif et — müşterilerin sana
            profilin üzerinden kolayca randevu alsın. Hizmetlerin ve çalışma saatlerin
            hazır, tek yapman gereken açmak!
          </p>
          <a href="/panel" className="ga-randevu-promo-btn">Panelden Randevuyu Aç →</a>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
          <a href="/panel" className="ga-list-cta">Panele Git →</a>
          <a href="/" className="ga-logout-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Ana Sayfa</a>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return <div className="ga-reg-done"><p>Yükleniyor…</p></div>;
  }

  return (
    <div className="ga-reg">
      <div className="ga-stepper">
        {[
          ...(needsAccount ? [{ n: 0, t: 'Hesap', s: 'E-posta & şifre' }] : []),
          { n: 1, t: 'İşletme', s: 'Bilgi & hizmetler' },
          { n: 2, t: 'Fotoğraflar', s: 'Görseller' },
          { n: 3, t: 'Konum', s: 'Adres & harita' },
          { n: 4, t: 'İletişim', s: 'Son adım' },
        ].map((s) => (
          <div key={s.n} className={`ga-step ${curStep === s.n ? 'active' : ''} ${curStep > s.n ? 'done' : ''}`} onClick={() => setStep(s.n)}>
            <span className="ga-step-num">{curStep > s.n ? '✓' : (s.n === 0 ? '🔑' : s.n)}</span>
            <span className="ga-step-lbl">{s.t}<small>{s.s}</small></span>
          </div>
        ))}
      </div>

      <div className="ga-reg-card">
        {needsAccount && curStep === 0 && (
          <div className="ga-reg-body">
            <div className="ga-reg-head"><span className="ga-reg-tag">🔑</span><div><h3>Hesap Oluşturun</h3><p>İşletmenizi yönetmek için bir hesap</p></div></div>
            <div className="ga-account-warn">
              ⚠️ <b>Önemli:</b> İşletme girişiniz buraya gireceğiniz <b>e-posta ve şifre</b> ile olacaktır. Daha sonra işletmenizi bu bilgilerle yönetecek, ziyaretçi ve arama istatistiklerinizi göreceksiniz. Lütfen bilgilerinizi not alın.
            </div>
            <div className="ga-field">
              <label>E-posta <span className="req">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" autoComplete="email" />
            </div>
            <div className="ga-grid2">
              <div className="ga-field">
                <label>Şifre <span className="req">*</span></label>
                <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="En az 6 karakter" autoComplete="new-password" />
              </div>
              <div className="ga-field">
                <label>Şifre (tekrar) <span className="req">*</span></label>
                <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Şifreyi tekrar girin" autoComplete="new-password" />
              </div>
            </div>
            <div className="ga-tip">Zaten hesabınız var mı? <a href="/giris" style={{ color: 'var(--gold)', fontWeight: 700 }}>Giriş yapın</a>, sonra işletme ekleyin.</div>
          </div>
        )}

        {curStep === 1 && (
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
                <label>Verdiğiniz hizmetler <span className="opt">(opsiyonel)</span></label>
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
              <label>Kısa açıklama <span className="opt">(opsiyonel)</span></label>
              <textarea value={desc} maxLength={300} onChange={(e) => setDesc(e.target.value)} placeholder="İşletmenizi kısaca açıklayınız…" />
              <div className="ga-counter">{desc.length}/300</div>
            </div>
          </div>
        )}

        {curStep === 2 && (
          <div className="ga-reg-body">
            <div className="ga-reg-head"><span className="ga-reg-tag">📷</span><div><h3>İşletme Fotoğrafları</h3><p>Mekânınızı ve örnek işlerinizi gösterin</p></div></div>
            {optimizing && <div className="ga-opt-note">Fotoğraflar optimize ediliyor…</div>}

            <div className="ga-field">
              <label>Mekân fotoğrafları <span className="opt">(opsiyonel · en fazla 10)</span></label>
              <label className="ga-drop" style={{ cursor: 'pointer', display: 'block' }}>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files, 'gallery')} />
                <div style={{ fontSize: 26 }}>🏢</div>
                <b>Mekân fotoğrafı ekle</b>
                <span>Tıklayın · Otomatik küçültülür (kalite korunur) · İlk foto vitrin olur</span>
              </label>
              {photos.length > 0 && (
                <div className="ga-thumbs">
                  {photos.map((p, i) => (
                    <div key={i} className="ga-thumb" style={{ backgroundImage: `url(${p.url})` }}>
                      <span className="ga-thumb-x" onClick={() => removePhoto(i, 'gallery')}>×</span>
                      {i === 0 && <span className="ga-thumb-cover">Vitrin</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ga-field" style={{ marginTop: 24 }}>
              <label>Örnek çalışmalar <span className="opt">(opsiyonel, en fazla 12)</span></label>
              <label className="ga-drop" style={{ cursor: 'pointer', display: 'block' }}>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files, 'work')} />
                <div style={{ fontSize: 26 }}>✨</div>
                <b>Örnek iş ekle</b>
                <span>Önce/sonra, yaptığınız işler — müşteri güvenini artırır</span>
              </label>
              {works.length > 0 && (
                <div className="ga-thumbs">
                  {works.map((p, i) => (
                    <div key={i} className="ga-thumb" style={{ backgroundImage: `url(${p.url})` }}>
                      <span className="ga-thumb-x" onClick={() => removePhoto(i, 'work')}>×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {curStep === 3 && (
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
              <label>Cadde / Sokak <span className="opt">(opsiyonel)</span></label>
              <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Cadde veya sokak adı" />
            </div>
            <div className="ga-field">
              <label>Harita üzerinde tam konumu işaretleyin <span className="opt">(opsiyonel)</span></label>
              {cityId ? (
                <LocationMap
                  center={mapCenter}
                  query={
                    distId
                      ? `${districts.find((d) => d.id === distId)?.name || ''}, ${provinces.find((p) => p.id === cityId)?.name || ''}, Türkiye`
                      : undefined
                  }
                  onPick={(lat, lng) => setPin({ lat, lng })}
                />
              ) : (
                <div className="ga-map-ph">📍 Önce il seçin, harita açılsın</div>
              )}
              <div className="ga-hint">Pini sürükleyin veya haritaya tıklayın. Tekerlek ile yakınlaştırabilirsiniz.</div>
            </div>
          </div>
        )}

        {curStep === 4 && (
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
            <div className="ga-tip">✦ Bilgileriniz incelendikten sonra yayına alınır. Kayıt ve listelenme tamamen ücretsizdir.</div>
            <div className="ga-randevu-hint">
              <div className="ga-randevu-hint-icon">📅</div>
              <div className="ga-randevu-hint-text">
                <b>Online Randevu Sistemi!</b>
                <span>İşletmeni ekledikten sonra panelinden randevu sistemini <b>tek tıkla aç</b> — müşterilerin sana profilin üzerinden kolayca randevu alsın. Hizmetlerin ve saatlerin hazır gelir!</span>
              </div>
            </div>
          </div>
        )}

        {errMsg && <div className="ga-err">{errMsg}</div>}
        <div className="ga-reg-nav">
          {curStep > minStep && <button type="button" className="ga-btn-back" onClick={back} disabled={sending}>← Geri</button>}
          {curStep < 4 && <button type="button" className="ga-btn-next" onClick={next}>Devam et →</button>}
          {curStep === 4 && <button type="button" className="ga-btn-submit" onClick={submit} disabled={sending}>{sending ? 'Gönderiliyor…' : 'Başvuruyu gönder ✓'}</button>}
        </div>
      </div>
    </div>
  );
}
