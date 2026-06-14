'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { getMyBusinessDetail, updateMyBusiness, type EditableBusiness } from '@/lib/queries-panel';

type Svc = { id: number; name: string };
type Cat = { id: number; name: string; slug: string; emoji: string | null; services: Svc[] };

export default function EditBusinessForm({
  businessId,
  categories,
}: {
  businessId: string;
  categories: Cat[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [biz, setBiz] = useState<EditableBusiness | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [checking, setChecking] = useState(true);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [xTwitter, setXTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) { router.push('/giris'); return; }
    if (user) {
      getMyBusinessDetail(businessId).then((data) => {
        if (!data) { setLoadErr('İşletme bulunamadı.'); setChecking(false); return; }
        if (data.owner_id !== user.id) { setLoadErr('Bu işletmeyi düzenleme yetkiniz yok.'); setChecking(false); return; }
        setBiz(data);
        setName(data.name || '');
        setDesc(data.description || '');
        setPhone(data.phone || '');
        setWhatsapp(data.whatsapp || '');
        setWebsite(data.website || '');
        setInstagram(data.instagram || '');
        setFacebook(data.facebook || '');
        setXTwitter(data.x_twitter || '');
        setLinkedin(data.linkedin || '');
        setSelectedServices(new Set(data.serviceIds));
        setChecking(false);
      });
    }
  }, [loading, user, businessId, router]);

  function toggleService(id: number) {
    const next = new Set(selectedServices);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedServices(next);
  }

  async function save() {
    setErrMsg('');
    if (!name.trim()) { setErrMsg('İşletme adı gerekli.'); return; }
    if (!phone.trim()) { setErrMsg('Telefon gerekli.'); return; }
    if (selectedServices.size === 0) { setErrMsg('En az bir hizmet seçin.'); return; }

    setSaving(true);
    const res = await updateMyBusiness(businessId, {
      name: name.trim(),
      description: desc.trim(),
      phone: phone.trim(),
      whatsapp, website, instagram, facebook, x_twitter: xTwitter, linkedin,
      serviceIds: Array.from(selectedServices),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrMsg(res.error || 'Güncelleme başarısız.');
    }
  }

  if (loading || checking) {
    return <p className="ga-static-lead">Yükleniyor…</p>;
  }
  if (loadErr) {
    return (
      <div className="ga-list-empty">
        <h3>{loadErr}</h3>
        <a href="/panel" className="ga-list-cta">Panele Dön →</a>
      </div>
    );
  }
  if (!biz) return null;

  return (
    <div className="ga-edit">
      {saved && <div className="ga-info-ok" style={{ marginBottom: 16 }}>✓ Değişiklikler kaydedildi.</div>}

      <div className="ga-edit-card">
        <h3>İşletme Bilgileri</h3>
        <div className="ga-field">
          <label>İşletme adı <span className="req">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="ga-field">
          <label>Kısa açıklama</label>
          <textarea value={desc} maxLength={300} onChange={(e) => setDesc(e.target.value)} />
          <div className="ga-counter">{desc.length}/300</div>
        </div>
      </div>

      <div className="ga-edit-card">
        <h3>Hizmetler <span className="req">*</span></h3>
        <p className="ga-svc-note">Sunduğunuz hizmetleri işaretleyin.</p>
        {categories.map((c) => (
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

      <div className="ga-edit-card">
        <h3>İletişim</h3>
        <div className="ga-grid2">
          <div className="ga-field"><label>Telefon <span className="req">*</span></label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0 5XX XXX XX XX" /></div>
          <div className="ga-field"><label>WhatsApp</label><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="0 5XX XXX XX XX" /></div>
        </div>
        <div className="ga-grid2">
          <div className="ga-field"><label>Web sitesi</label><input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" /></div>
          <div className="ga-field"><label>Instagram</label><input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@kullaniciadi" /></div>
        </div>
        <div className="ga-grid2">
          <div className="ga-field"><label>Facebook</label><input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="facebook.com/…" /></div>
          <div className="ga-field"><label>X (Twitter)</label><input value={xTwitter} onChange={(e) => setXTwitter(e.target.value)} placeholder="@kullaniciadi" /></div>
        </div>
        <div className="ga-field"><label>LinkedIn</label><input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/company/…" /></div>
      </div>

      <div className="ga-edit-note">
        Not: Fotoğraf, konum ve adres düzenleme yakında eklenecek. Şu an bilgi, hizmet ve iletişim güncelleyebilirsiniz.
      </div>

      {errMsg && <div className="ga-err">{errMsg}</div>}

      <div className="ga-edit-actions">
        <button className="ga-btn-submit" style={{ marginLeft: 0 }} onClick={save} disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </div>
  );
}
