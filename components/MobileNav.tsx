'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

export default function MobileNav() {
  const path = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return path === '/';
    return path.startsWith(href);
  };

  return (
    <nav className="ga-mobilenav">
      <Link href="/" className={`ga-mn-item ${isActive('/') ? 'active' : ''}`}>
        <span className="ga-mn-icon">✨</span>
        <span className="ga-mn-label">Keşfet</span>
      </Link>
      <Link href="/ara" className={`ga-mn-item ${isActive('/ara') ? 'active' : ''}`}>
        <span className="ga-mn-icon">🔍</span>
        <span className="ga-mn-label">Ara</span>
      </Link>
      <Link href="/isletme-ekle" className="ga-mn-item ga-mn-center">
        <span className="ga-mn-plus">+</span>
        <span className="ga-mn-label">İşletme Ekle</span>
      </Link>
      <Link href="/yakinimda" className={`ga-mn-item ${isActive('/yakinimda') ? 'active' : ''}`}>
        <span className="ga-mn-icon">📍</span>
        <span className="ga-mn-label">Yakınımda</span>
      </Link>
      <Link href={user ? '/panel' : '/giris'} className={`ga-mn-item ${(isActive('/giris') || isActive('/panel')) ? 'active' : ''}`}>
        <span className="ga-mn-icon">👤</span>
        <span className="ga-mn-label">İşletmem</span>
      </Link>
    </nav>
  );
}
