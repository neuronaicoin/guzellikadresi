import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'İşletme Kaydı',
  description: 'Ücretsiz işletme hesabı oluşturun. İşletmenizi ekleyin, müşterilere ulaşın.',
};

export default function RegisterPage() {
  return (
    <>
      <Header />
      <div className="ga-static-wrap" style={{ maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
          <h1>Hesap Oluştur</h1>
          <p className="ga-static-lead">Ücretsiz hesap açın, işletmenizi yönetmeye başlayın.</p>
        </div>
        <AuthForm mode="register" />
      </div>
      <Footer />
    </>
  );
}
