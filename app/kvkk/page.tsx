import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'KVKK Aydınlatma Metni' };

export default function KvkkPage() {
  return (
    <>
      <Header />
      <div className="ga-static-wrap">
        <h1>KVKK Aydınlatma Metni</h1>
        <p className="ga-static-lead">6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme</p>

        <h2>Veri Sorumlusu</h2>
        <p>GüzellikAdresin, kişisel verilerinizin işlenmesi süreçlerinde veri sorumlusu olarak hareket eder.</p>

        <h2>İşlenen Kişisel Veriler</h2>
        <p>İşletme kaydı sırasında ad-soyad, telefon, e-posta, işletme bilgileri ve konum bilgileri gibi veriler işlenebilir.</p>

        <h2>İşleme Amacı</h2>
        <p>Kişisel verileriniz; işletmenizin platformda listelenmesi, hizmet arayan kullanıcılarla buluşturulması ve platform hizmetlerinin sunulması amacıyla işlenir.</p>

        <h2>Haklarınız</h2>
        <p>KVKK'nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz. Bu haklarınızı kullanmak için iletişim sayfamızdan bize ulaşabilirsiniz.</p>

        <h2>Veri Güvenliği</h2>
        <p>Kişisel verilerinizin güvenliği için gerekli teknik ve idari tedbirler alınmaktadır.</p>

        <p style={{ marginTop: 30, fontSize: 13, color: 'var(--muted)' }}>Not: Bu metin genel bir bilgilendirme amaçlıdır ve yasal danışmanlık yerine geçmez. Resmi kullanım öncesi bir hukuk danışmanına danışmanız önerilir.</p>
      </div>
      <Footer />
    </>
  );
}
