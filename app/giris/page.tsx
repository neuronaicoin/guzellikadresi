import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'İşletme Girişi',
  description: 'İşletme hesabınıza giriş yapın. Profilinizi yönetin, istatistiklerinizi görün.',
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="ga-static-wrap" style={{ maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
          <h1>İşletme Girişi</h1>
          <p className="ga-static-lead">İşletme panelinize giriş yapın.</p>
        </div>
        <AuthForm mode="login" />
      </div>
      <Footer />
    </>
  );
}
