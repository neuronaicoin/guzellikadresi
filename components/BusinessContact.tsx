'use client';
import { useEffect, useState } from 'react';
import { trackView, trackEvent } from '@/lib/track';
import BookingModal from '@/components/BookingModal';

type Props = {
  businessId: string;
  name?: string;
  slug?: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  x_twitter: string | null;
  linkedin: string | null;
  // Randevu sistemi (opsiyonel — sadece aktifse buton görünür)
  randevuAktif?: boolean;
  staffCount?: number;
  showPrice?: boolean;
};
function normalizeSocial(val: string, type: string): string {
  const v = val.trim();
  if (v.startsWith('http')) return v;
  const handle = v.replace(/^@/, '');
  switch (type) {
    case 'instagram': return `https://instagram.com/${handle}`;
    case 'facebook': return `https://facebook.com/${handle}`;
    case 'x': return `https://x.com/${handle}`;
    case 'linkedin': return v.includes('/') ? `https://${v.replace(/^https?:\/\//, '')}` : `https://linkedin.com/company/${handle}`;
    default: return v;
  }
}
export default function BusinessContact(p: Props) {
  const [showBooking, setShowBooking] = useState(false);
  useEffect(() => {
    trackView(p.businessId);
  }, [p.businessId]);
  return (
    <div className="ga-contact-card">
      <h3>İletişim</h3>

      {/* RANDEVU AL — sadece randevu sistemi aktifse */}
      {p.randevuAktif && (
        <button
          className="ga-c-btn ga-c-randevu"
          onClick={() => setShowBooking(true)}
        >
          📅 Randevu Al
        </button>
      )}

      {p.phone && (
        <a href={`tel:${p.phone}`} className="ga-c-btn ga-c-call" onClick={() => trackEvent(p.businessId, 'phone_click')}>
          📞 {p.phone}
        </a>
      )}
      {p.whatsapp && (
        <a href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" className="ga-c-btn ga-c-wa" onClick={() => trackEvent(p.businessId, 'whatsapp_click')}>
          💬 WhatsApp
        </a>
      )}
      {p.website && <a href={p.website} target="_blank" rel="noopener" className="ga-c-btn ga-c-web" onClick={() => trackEvent(p.businessId, 'website_click')}>🌐 Web Sitesi</a>}
      <div className="ga-socials">
        {p.instagram && <a href={normalizeSocial(p.instagram, 'instagram')} target="_blank" rel="noopener" onClick={() => trackEvent(p.businessId, 'instagram_click')}>Instagram</a>}
        {p.facebook && <a href={normalizeSocial(p.facebook, 'facebook')} target="_blank" rel="noopener" onClick={() => trackEvent(p.businessId, 'facebook_click')}>Facebook</a>}
        {p.x_twitter && <a href={normalizeSocial(p.x_twitter, 'x')} target="_blank" rel="noopener" onClick={() => trackEvent(p.businessId, 'x_click')}>X</a>}
        {p.linkedin && <a href={normalizeSocial(p.linkedin, 'linkedin')} target="_blank" rel="noopener" onClick={() => trackEvent(p.businessId, 'linkedin_click')}>LinkedIn</a>}
      </div>
      <ShareButtons name={p.name} slug={p.slug} />

      {showBooking && (
        <BookingModal
          businessId={p.businessId}
          businessName={p.name || 'İşletme'}
          whatsapp={p.whatsapp}
          staffCount={p.staffCount || 1}
          showPrice={p.showPrice || false}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
function ShareButtons({ name, slug }: { name?: string; slug?: string }) {
  const url = slug ? `https://guzellikadresin.com/isletme/${slug}` : (typeof window !== 'undefined' ? window.location.href : '');
  const text = `${name || 'Bu işletme'} - GüzellikAdresin'de`;
  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
  }
  async function shareGeneric() {
    if (navigator.share) {
      try { await navigator.share({ title: name, text, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Bağlantı kopyalandı!');
      } catch {}
    }
  }
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #eee' }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Bu işletmeyi paylaş</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={shareWhatsApp}
          style={{ flex: 1, padding: '9px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          WhatsApp'ta paylaş
        </button>
        <button
          onClick={shareGeneric}
          style={{ padding: '9px 14px', background: '#0e2148', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Paylaş
        </button>
      </div>
    </div>
  );
}
