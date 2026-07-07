import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import AppointmentSettings from '@/components/AppointmentSettings';

export const metadata = {
  title: 'Randevu Ayarları',
  robots: { index: false },
};

export default function RandevuAyarlariPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <div className="ga-static-wrap" style={{ maxWidth: 720 }}>
        <BackButton label="Panele dön" />
        <h1>Randevu Ayarları</h1>
        <p className="ga-static-lead">
          Online randevu sistemini yönetin: hizmetler, kapasite ve fiyat gösterimi.
        </p>
        <AppointmentSettings businessId={params.id} />
      </div>
      <Footer />
    </>
  );
}
