import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import EditBusinessForm from '@/components/EditBusinessForm';
import { getCategoriesForForm, getProvincesForForm } from '@/lib/queries-form';

export const metadata = {
  title: 'İşletme Düzenle',
  robots: { index: false },
};

export default async function EditPage({ params }: { params: { id: string } }) {
  const [categories, provinces] = await Promise.all([
    getCategoriesForForm(),
    getProvincesForForm(),
  ]);

  return (
    <>
      <Header />
      <div className="ga-static-wrap" style={{ maxWidth: 720 }}>
        <BackButton label="Panele dön" />
        <h1>İşletme Düzenle</h1>
        <p className="ga-static-lead">İşletme bilgilerinizi güncelleyin.</p>
        <EditBusinessForm businessId={params.id} categories={categories as any} provinces={provinces as any} />
      </div>
      <Footer />
    </>
  );
}
