import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegisterForm from '@/components/RegisterForm';
import { getCategoriesForForm, getProvincesForForm } from '@/lib/queries-form';

export const metadata = {
  title: 'İşletme Ekle — Ücretsiz Kayıt',
  description: 'Güzellik veya bakım işletmenizi ücretsiz ekleyin, binlerce yeni müşteriyle buluşun.',
};

export const revalidate = 3600;

export default async function IsletmeEklePage() {
  const [categories, provinces] = await Promise.all([
    getCategoriesForForm(),
    getProvincesForForm(),
  ]);

  return (
    <>
      <Header />
      <div className="ga-reg-strip">
        <div className="ga-reg-strip-inner">
          <div className="ga-crumb"><b>Ana Sayfa</b> › İşletme Kaydı</div>
          <span className="ga-free-badge"><span className="dot" /> Kayıt tamamen ücretsiz</span>
          <h1>İşletmeni <span>ücretsiz</span> ekle</h1>
          <p>Bölgendeki binlerce müşteri seni saniyeler içinde bulsun. Birkaç dakikada profilini oluştur.</p>
        </div>
      </div>

      <div className="ga-reg-wrap">
        <RegisterForm categories={categories} provinces={provinces} />
      </div>

      <Footer />
    </>
  );
}
