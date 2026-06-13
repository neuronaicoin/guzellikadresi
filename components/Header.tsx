import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';

export default function Header() {
  return (
    <header style={{ background: 'var(--navy)', color: '#fff', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 22px', height: 64, display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 20 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#c9a24b,#b88a32)', display: 'grid', placeItems: 'center', color: 'var(--navy)', fontWeight: 900 }}>G</span>
          <span>Güzellik<span style={{ color: 'var(--gold)' }}>Adresi</span></span>
        </Link>

        <nav className="ga-nav" style={{ display: 'flex', gap: 22, fontSize: 14.5, fontWeight: 600, color: '#c5cde0' }}>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/kategoriler">Kategoriler</Link>
          <Link href="/sehirler">Şehirler</Link>
          <Link href="/nasil-calisir">Nasıl Çalışır?</Link>
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/giris" className="ga-login" style={{ padding: '10px 18px', borderRadius: 10, fontSize: 14.5, fontWeight: 700, border: '1px solid rgba(255,255,255,.22)', color: '#dfe5f1' }}>Giriş Yap</Link>
          <Link href="/isletme-ekle" style={{ padding: '10px 18px', borderRadius: 10, fontSize: 14.5, fontWeight: 700, background: 'var(--gold)', color: 'var(--navy)' }}>İşletme Ekle</Link>
        </div>
      </div>
    </header>
  );
}
