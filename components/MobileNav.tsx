'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const path = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return path === '/';
    return path.startsWith(href);
  };

  return (
    <nav className="ga-mobilenav">
      <Link href="/" className={`ga-mn-item ${isActive('/') ? 'active' : ''}`}>
        <span className="ga-mn-icon">🏠</span>
        <span className="ga-mn-label">Ana Sayfa</span>
      </Link>
      <Link href="/ara" className={`ga-mn-item ${isActive('/ara') ? 'active' : ''}`}>
        <span className="ga-mn-icon">🔍</span>
        <span className="ga-mn-label">Ara</span>
      </Link>
      <Link href="/isletme-ekle" className="ga-mn-item ga-mn-center">
        <span className="ga-mn-plus">+</span>
        <span className="ga-mn-label">İşletme Ekle</span>
      </Link>
      <Link href="/kategoriler" className={`ga-mn-item ${isActive('/kategoriler') ? 'active' : ''}`}>
        <span className="ga-mn-icon">▤</span>
        <span className="ga-mn-label">Kategoriler</span>
      </Link>
      <Link href="/giris" className={`ga-mn-item ${isActive('/giris') ? 'active' : ''}`}>
        <span className="ga-mn-icon">👤</span>
        <span className="ga-mn-label">Giriş</span>
      </Link>
    </nav>
  );
}
