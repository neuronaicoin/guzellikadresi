import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'İşletme Girişi',
  description: 'İşletme hesabınıza giriş yapın. Profilinizi yönetin, istatistiklerinizi görün.',
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="ga-static-wrap" style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
        <h1>İşletme Girişi</h1>
        <p className="ga-static-lead">
          İşletme giriş paneli çok yakında! Yakında işletme hesabınıza giriş yapıp
          profilinizi düzenleyebil, kaç kişinin sizi görüntülediğini ve aradığını takip edebileceksiniz.
        </p>
        <div style={{ background: 'var(--gold-50)', border: '1px solid var(--gold-soft)', borderRadius: 14, padding: 22, marginTop: 20 }}>
          <p style={{ margin: 0, color: '#7a6429', fontWeight: 600 }}>
            Henüz işletmenizi eklemediniz mi?
          </p>
          <a href="/isletme-ekle" className="ga-list-cta" style={{ marginTop: 14 }}>
            İşletmenizi Ücretsiz Ekleyin →
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}
