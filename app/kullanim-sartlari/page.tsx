import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'Kullanım Şartları' };

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="ga-static-wrap">
        <h1>Kullanım Şartları</h1>
        <p className="ga-static-lead">Platformu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.</p>

        <h2>Hizmetin Kapsamı</h2>
        <p>GüzellikAdresin, güzellik ve bakım işletmelerini kullanıcılarla buluşturan bir rehber platformudur. Platform, işletmeler ile kullanıcılar arasında aracılık yapmaz; yalnızca bilgi sunar.</p>

        <h2>İşletme Sorumlulukları</h2>
        <p>Kayıt olan işletmeler, sağladıkları bilgilerin doğru ve güncel olmasından sorumludur. Yanıltıcı, yasa dışı veya yanlış bilgi içeren kayıtlar kaldırılabilir.</p>

        <h2>Kullanıcı Sorumlulukları</h2>
        <p>Kullanıcılar, platformu yalnızca yasalara uygun amaçlarla kullanmayı kabul eder. İşletmelerle yapılan görüşme ve işlemler kullanıcının kendi sorumluluğundadır.</p>

        <h2>İçerik ve Telif</h2>
        <p>Platformdaki tüm içerik ve tasarım GüzellikAdresin'e aittir. İzinsiz kopyalanamaz veya çoğaltılamaz. İşletmelerin yüklediği fotoğraf ve içeriklerin sorumluluğu ilgili işletmeye aittir.</p>

        <h2>Değişiklikler</h2>
        <p>GüzellikAdresin, bu şartları önceden haber vermeksizin güncelleme hakkını saklı tutar.</p>

        <p style={{ marginTop: 30, fontSize: 13, color: 'var(--muted)' }}>Not: Bu metin genel bir bilgilendirme amaçlıdır ve yasal danışmanlık yerine geçmez.</p>
      </div>
      <Footer />
    </>
  );
}
