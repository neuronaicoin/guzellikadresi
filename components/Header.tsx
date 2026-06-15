'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const girisHref = user ? '/panel' : '/giris';
  const girisLabel = user ? 'Panelim' : 'İşletme Girişi';

  return (
    <header className="ga-header">
      <div className="ga-header-inner">
        <Link href="/" className="ga-logo" onClick={() => setOpen(false)}>
          <span className="ga-logo-badge" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 4 C15 4 4 15 4 30 C4 49 30 76 30 76 C30 76 56 49 56 30 C56 15 45 4 30 4 Z" fill="#d4af5a"/>
              <text x="30" y="41" textAnchor="middle" fontSize="30" fontFamily="sans-serif" fontWeight="700" fill="#ffffff">G</text>
            </svg>
          </span>
          <span>Güzellik<span style={{ color: 'var(--gold)' }}>Adresin</span></span>
        </Link>

        {/* masaüstü menü */}
        <nav className="ga-nav-desktop">
          <Link href="/">Ana Sayfa</Link>
          <Link href="/kategoriler">Kategoriler</Link>
          <Link href="/sehirler">Şehirler</Link>
          <Link href="/rehber">Rehber</Link>
        </nav>

        <div className="ga-header-actions">
          <Link href={girisHref} className="ga-login">{girisLabel}</Link>
          <Link href="/isletme-ekle" className="ga-cta-btn">İşletme Ekle</Link>
          {/* hamburger (sadece mobil) */}
          <button className="ga-burger" onClick={() => setOpen(!open)} aria-label="Menü">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* mobil açılır menü */}
      {open && (
        <nav className="ga-nav-mobile">
          <Link href="/" onClick={() => setOpen(false)}>Ana Sayfa</Link>
          <Link href="/kategoriler" onClick={() => setOpen(false)}>Kategoriler</Link>
          <Link href="/sehirler" onClick={() => setOpen(false)}>Şehirler</Link>
          <Link href="/rehber" onClick={() => setOpen(false)}>Rehber</Link>
          <Link href={girisHref} onClick={() => setOpen(false)}>{girisLabel}</Link>
          <Link href="/isletme-ekle" className="ga-nav-mobile-cta" onClick={() => setOpen(false)}>İşletme Ekle →</Link>
        </nav>
      )}
    </header>
  );
}
