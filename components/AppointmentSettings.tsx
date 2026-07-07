'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import {
  getAppointmentSettings, updateAppointmentSettings,
  getAppointmentServices, saveAppointmentServices,
  getBusinessCategorySlug,
} from '@/lib/queries-appointment';
import { getMyBusinessDetail } from '@/lib/queries-panel';
import { APPOINTMENT_TEMPLATES, TYPE_NOTES } from '@/lib/appointment-templates';

type SvcRow = { name: string; duration_min: number; price: number | null };

export default function AppointmentSettings({ businessId }: { businessId: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const [catSlug, setCatSlug] = useState<string | null>(null);

  // Ayarlar
  const [randevuAktif, setRandevuAktif] = useState(false);
  const [staffCount, setStaffCount] = useState(1);
  const [showPrice, setShowPrice] = useState(false);

  // Hizmetler
  const [services, setServices] = useState<SvcRow[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) { router.push('/giris'); return; }
    if (user) {
      (async () => {
        // Sahiplik kontrolü (mevcut desen)
        const detail = await getMyBusinessDetail(businessId);
        if (!detail) { setLoadErr('İşletme bulunamadı.'); setChecking(false); return; }
        if (detail.owner_id !== user.id) {
          setLoadErr('Bu işletmeyi düzenleme yetkiniz yok.'); setChecking(false); return;
        }

        const [settings, svcList, slug] = await Promise.all([
          getAppointmentSettings(businessId),
          getAppointmentServices(businessId),
          getBusinessCategorySlug(businessId),
        ]);

        if (settings) {
          setRandevuAktif(settings.randevu_aktif);
          setStaffCount(settings.staff_count || 1);
          setShowPrice(settings.show_price);
        }
        setCatSlug(slug);

        if (svcList.length > 0) {
          // Kayıtlı hizmetler var → onları göster
          setServices(svcList.map((s) => ({
            name: s.name, duration_min: s.duration_min, price: s.price,
          })));
        } else if (slug && APPOINTMENT_TEMPLATES[slug]) {
          // Hiç hizmet yok → kategori şablonunu otomatik yükle
          const tmpl = APPOINTMENT_TEMPLATES[slug];
          setServices(tmpl.services.map((s) => ({ ...s })));
          setShowPrice(tmpl.type === 'classic' || tmpl.type === 'walkin');
        }
        setChecking(false);
      })();
    }
  }, [loading, user, businessId, router]);

  function loadTemplate() {
    if (!catSlug || !APPOINTMENT_TEMPLATES[catSlug]) return;
    const tmpl = APPOINTMENT_TEMPLATES[catSlug];
    setServices(tmpl.services.map((s) => ({ ...s })));
    setShowPrice(tmpl.type === 'classic' || tmpl.type === 'walkin');
  }

  function updSvc(i: number, key: keyof SvcRow, val: string) {
    const next = [...services];
    if (key === 'duration_min') next[i].duration_min = parseInt(val) || 0;
    else if (key === 'price') next[i].price = val === '' ? null : (parseInt(val) || 0);
    else next[i].name = val;
    setServices(next);
  }

  function addSvc() {
    setServices([...services, { name: 'Yeni Hizmet', duration_min: 30, price: showPrice ? 0 : null }]);
  }

  function delSvc(i: number) {
    setServices(services.filter((_, idx) => idx !== i));
  }

  function chgStaff(d: number) {
    setStaffCount((v) => Math.max(1, Math.min(20, v + d)));
  }

  async function save() {
    setErrMsg('');
    // Doğrulama
    const clean = services.filter((s) => s.name.trim().length > 0);
    if (randevuAktif && clean.length === 0) {
      setErrMsg('Randevu sistemi açıkken en az bir hizmet gerekli.');
      return;
    }
    setSaving(true);
    // 1) Ayarları kaydet
    const r1 = await updateAppointmentSettings(businessId, {
      staff_count: staffCount, show_price: showPrice, randevu_aktif: randevuAktif,
    });
    if (!r1.ok) { setSaving(false); setErrMsg(r1.error || 'Ayarlar kaydedilemedi.'); return; }
    // 2) Hizmetleri kaydet
    const r2 = await saveAppointmentServices(businessId, clean.map((s) => ({
      name: s.name, duration_min: s.duration_min,
      price: showPrice ? s.price : null,   // fiyat gizliyse null kaydet
    })));
    setSaving(false);
    if (!r2.ok) { setErrMsg(r2.error || 'Hizmetler kaydedilemedi.'); return; }
    setSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading || checking) return <p className="ga-static-lead">Yükleniyor…</p>;
  if (loadErr) {
    return (
      <div className="ga-list-empty">
        <h3>{loadErr}</h3>
        <a href="/panel" className="ga-list-cta">Panele Dön →</a>
      </div>
    );
  }

  const tmplType = catSlug && APPOINTMENT_TEMPLATES[catSlug]?.type;

  return (
    <div className="ga-edit">
      {saved && <div className="ga-info-ok" style={{ marginBottom: 16 }}>✓ Randevu ayarları kaydedildi.</div>}

      {/* PREMIUM: Randevu sistemi aç/kapat */}
      <div className="ga-edit-card">
        <h3>Randevu Sistemi</h3>
        <div className="toggle-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff8e1', border: '2px solid #f5c518', padding: 15, borderRadius: 12 }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Online randevu sistemini aç</div>
          <label className="ga-switch">
            <input type="checkbox" checked={randevuAktif} onChange={(e) => setRandevuAktif(e.target.checked)} />
            <span className="ga-slider" />
          </label>
        </div>
        <p className="ga-svc-note" style={{ marginTop: 8 }}>
          Açtığında işletme profilinde "Randevu Al" butonu görünür. Kapalıyken müşteriler randevu alamaz.
        </p>
      </div>

      {/* Kapasite */}
      <div className="ga-edit-card">
        <h3>Kapasite</h3>
        <div className="ga-field">
          <label>Aynı anda kaç müşteriye hizmet verebilirsiniz?</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <button type="button" className="ga-np-btn" onClick={() => chgStaff(-1)}>−</button>
            <span style={{ fontSize: 20, fontWeight: 800, minWidth: 30, textAlign: 'center' }}>{staffCount}</span>
            <button type="button" className="ga-np-btn" onClick={() => chgStaff(1)}>+</button>
          </div>
          <p className="ga-svc-note" style={{ marginTop: 8 }}>
            Örneğin 3 seçerseniz, aynı saate 3 müşteri randevu alabilir (3 koltuk/çalışanınız varsa).
          </p>
        </div>
      </div>

      {/* Fiyat gösterimi */}
      <div className="ga-edit-card">
        <h3>Fiyat Gösterimi</h3>
        <div className="toggle-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 4 }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Fiyatları müşteriye göster</div>
          <label className="ga-switch">
            <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} />
            <span className="ga-slider" />
          </label>
        </div>
        <p className="ga-svc-note" style={{ marginTop: 8 }}>
          Kapalıyken müşteri fiyat görmez ("Fiyat için sorun" yazar).
        </p>
      </div>

      {/* Hizmetler */}
      <div className="ga-edit-card">
        <h3>Hizmetler</h3>
        {tmplType && TYPE_NOTES[tmplType] && (
          <div className="note-box" style={{ background: '#fff8e1', border: '1px solid #f5c518', borderRadius: 10, padding: 11, fontSize: 12.5, color: '#8a6d00', marginBottom: 12, lineHeight: 1.5 }}>
            {TYPE_NOTES[tmplType]}
          </div>
        )}
        {catSlug && APPOINTMENT_TEMPLATES[catSlug] && (
          <button type="button" className="ga-chip" style={{ marginBottom: 12 }} onClick={loadTemplate}>
            ↻ Kategori şablonunu yeniden yükle
          </button>
        )}

        {services.map((s, i) => (
          <div key={i} className="ga-svc-edit" style={{ border: '2px solid var(--line, #eef1f6)', borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                style={{ flex: 2 }}
                value={s.name}
                onChange={(e) => updSvc(i, 'name', e.target.value)}
                placeholder="Hizmet adı"
              />
              <div style={{ position: 'relative', flex: 1, maxWidth: 100 }}>
                <input
                  type="number"
                  value={s.duration_min}
                  onChange={(e) => updSvc(i, 'duration_min', e.target.value)}
                  style={{ paddingRight: 30 }}
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: '#7a869a', pointerEvents: 'none' }}>dk</span>
              </div>
              <button type="button" className="ga-photo-del" onClick={() => delSvc(i)} aria-label="Sil"
                style={{ background: '#fff0f0', color: '#e05252', border: 'none', width: 38, height: 44, borderRadius: 10, fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>×</button>
            </div>
            {showPrice && (
              <div style={{ position: 'relative', marginTop: 8, maxWidth: 160 }}>
                <input
                  type="number"
                  value={s.price ?? ''}
                  onChange={(e) => updSvc(i, 'price', e.target.value)}
                  placeholder="Fiyat"
                  style={{ paddingRight: 40 }}
                />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#7a869a', pointerEvents: 'none' }}>TL</span>
              </div>
            )}
          </div>
        ))}

        <button type="button" className="ga-btn-submit" style={{ marginLeft: 0, background: 'var(--navy, #0e2148)' }} onClick={addSvc}>
          + Hizmet Ekle
        </button>
      </div>

      {errMsg && <div className="ga-err">{errMsg}</div>}

      <div className="ga-edit-actions">
        <button className="ga-btn-submit" style={{ marginLeft: 0 }} onClick={save} disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Randevu Ayarlarını Kaydet'}
        </button>
      </div>
    </div>
  );
}
