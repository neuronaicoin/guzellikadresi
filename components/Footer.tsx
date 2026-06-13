import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy)', color: '#aab8d4', marginTop: 40 }}>
      <div className="ga-footer-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 22px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 20, marginBottom: 12, color: '#fff' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#c9a24b,#b88a32)', display: 'grid', placeItems: 'center', color: 'var(--navy)', fontWeight: 900 }}>G</span>
            Güzellik<span style={{ color: 'var(--gold)' }}>Adresi</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 300, color: '#aab8d4' }}>
            Türkiye genelinde güzellik ve bakım hizmeti veren işletmeleri tek çatı altında buluşturan ücretsiz rehber. Ara, karşılaştır, ulaş.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Kategoriler</h4>
          <Link href="/kategori/guzellik-merkezi" style={fLink}>Güzellik Merkezi</Link>
          <Link href="/kategori/medikal-estetik" style={fLink}>Medikal Estetik</Link>
          <Link href="/kategori/bayan-kuaforu" style={fLink}>Bayan Kuaförü</Link>
          <Link href="/kategori/sac-ekimi" style={fLink}>Saç Ekimi</Link>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Şehirler</h4>
          <Link href="/istanbul" style={fLink}>İstanbul</Link>
          <Link href="/ankara" style={fLink}>Ankara</Link>
          <Link href="/izmir" style={fLink}>İzmir</Link>
          <Link href="/antalya" style={fLink}>Antalya</Link>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Kurumsal</h4>
          <Link href="/hakkimizda" style={fLink}>Hakkımızda</Link>
          <Link href="/isletme-ekle" style={fLink}>İşletme Ekle</Link>
          <Link href="/iletisim" style={fLink}>İletişim</Link>
          <Link href="/gizlilik" style={fLink}>Gizlilik Politikası</Link>
          <Link href="/kvkk" style={fLink}>KVKK Aydınlatma</Link>
          <Link href="/kullanim-sartlari" style={fLink}>Kullanım Şartları</Link>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', padding: '16px 22px', textAlign: 'center', fontSize: 12.5, color: '#7e8bab' }}>
        © {new Date().getFullYear()} GüzellikAdresi · Tüm hakları saklıdır.
      </div>
    </footer>
  );
}

const fLink: React.CSSProperties = { display: 'block', fontSize: 13, color: '#aab8d4', padding: '4px 0' };
