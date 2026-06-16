import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Liste sayfaları için yükleniyor iskeleti (kategori, il, ilçe, arama, hizmet)
export default function ListingSkeleton() {
  return (
    <>
      <Header />
      <div className="ga-sk-wrap">
        <div className="ga-sk ga-sk-title" />
        <div className="ga-sk-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="ga-sk-card" key={i}>
              <div className="ga-sk ga-sk-cover" />
              <div className="ga-sk ga-sk-line" />
              <div className="ga-sk ga-sk-line sm" />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
