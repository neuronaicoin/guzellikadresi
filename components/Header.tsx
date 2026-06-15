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
            <svg width="22" height="22" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 5 C16 5 5 16 5 30 C5 48 30 75 30 75 C30 75 55 48 55 30 C55 16 44 5 30 5 Z" fill="#0e2148"/>
              <path d="M30 20 L33 28 L41 30 L33 32 L30 40 L27 32 L19 30 L27 28 Z" fill="#c9a24b"/>
              <circle cx="30" cy="30" r="3.5" fill="#c9a24b"/>
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
