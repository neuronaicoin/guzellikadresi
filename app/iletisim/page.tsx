import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'İletişim',
  description: 'GüzellikAdresin ile iletişime geçin. Soru, öneri ve işbirliği talepleriniz için bize ulaşın.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="ga-static-wrap">
        <h1>İletişim</h1>
        <p className="ga-static-lead">Soru, öneri veya işbirliği talepleriniz için aşağıdaki formu doldurun, en kısa sürede dönüş yapalım.</p>
        <ContactForm />
      </div>
      <Footer />
    </>
  );
}
