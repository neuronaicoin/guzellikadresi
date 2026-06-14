'use client';

import { useEffect } from 'react';
import { trackView, trackEvent } from '@/lib/track';

type Props = {
  businessId: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  x_twitter: string | null;
  linkedin: string | null;
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
  useEffect(() => {
    trackView(p.businessId);
  }, [p.businessId]);

  return (
    <div className="ga-contact-card">
      <h3>İletişim</h3>
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
    </div>
  );
}
