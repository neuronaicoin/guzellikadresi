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
          <span className="ga-logo-badge">G</span>
          <span>Güzellik<span style={{ color: 'var(--gold)' }}>Adresi</span></span>
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
