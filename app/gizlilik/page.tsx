import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'Gizlilik Politikası' };

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="ga-static-wrap">
        <h1>Gizlilik Politikası</h1>
        <p className="ga-static-lead">Son güncelleme: {new Date().getFullYear()}</p>

        <p>GüzellikAdresin olarak gizliliğinize önem veriyoruz. Bu politika, platformumuzu kullanırken hangi verilerin toplandığını ve nasıl kullanıldığını açıklar.</p>

        <h2>Toplanan Bilgiler</h2>
        <p>İşletme kaydı sırasında işletme adı, kategori, konum, iletişim bilgileri ve fotoğraflar gibi sizin tarafınızdan sağlanan bilgileri toplarız. Ayrıca platformu iyileştirmek amacıyla anonim kullanım verileri (ziyaret edilen sayfalar gibi) toplanabilir.</p>

        <h2>Bilgilerin Kullanımı</h2>
        <p>Sağladığınız bilgiler, işletmenizin platformda listelenmesi ve müşterilerle buluşturulması amacıyla kullanılır. İşletme iletişim bilgileri, hizmet arayan kullanıcılara gösterilir.</p>

        <h2>Çerezler</h2>
        <p>Platform, kullanıcı deneyimini iyileştirmek için çerezler kullanabilir. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.</p>

        <h2>Üçüncü Taraflar</h2>
        <p>Verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz veya satılmaz.</p>

        <h2>İletişim</h2>
        <p>Gizlilikle ilgili sorularınız için iletişim sayfamızdan bize ulaşabilirsiniz.</p>

        <p style={{ marginTop: 30, fontSize: 13, color: 'var(--muted)' }}>Not: Bu metin genel bir bilgilendirme amaçlıdır ve yasal danışmanlık yerine geçmez.</p>
      </div>
      <Footer />
    </>
  );
}
