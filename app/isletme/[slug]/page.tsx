import { notFound } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import BackButton from '@/components/BackButton';
import BusinessContact from '@/components/BusinessContact';
import { getBusinessBySlug } from '@/lib/queries-business';
const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false });
export const revalidate = 600;
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const b = await getBusinessBySlug(params.slug);
  if (!b) return { title: 'İşletme bulunamadı' };
  const loc = [b.district?.name, b.province?.name].filter(Boolean).join(', ');
  return {
    title: `${b.name} — ${loc}`,
    description: b.description || `${b.name}, ${loc}. ${b.category?.name || ''} hizmetleri. GüzellikAdresin'de keşfedin.`,
  };
}export default async function BusinessPage({ params }: { params: { slug: string } }) {
  const b = await getBusinessBySlug(params.slug);
  if (!b) notFound();
  const loc = [b.district?.name, b.province?.name].filter(Boolean).join(', ');
  // LocalBusiness schema (Google zengin sonuç)
  const pageUrl = `https://guzellikadresin.com/isletme/${b.slug}`;
  const sameAs = [b.instagram, b.facebook, b.website].filter(Boolean);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    '@id': pageUrl,
    name: b.name,
    description: b.description || undefined,
    image: b.coverUrl || undefined,
    telephone: b.phone || undefined,
    url: pageUrl,
    ...(b.category?.name ? { knowsAbout: b.category.name } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address || undefined,
      addressLocality: b.district?.name || undefined,
      addressRegion: b.province?.name || undefined,
      addressCountry: 'TR',
    },...(b.lat && b.lng ? { geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng } } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
  // Breadcrumb schema (Google'da yol gösterimi)
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://guzellikadresin.com/' },
      ...(b.province ? [{ '@type': 'ListItem', position: 2, name: b.province.name, item: `https://guzellikadresin.com/${b.province.slug}` }] : []),
      ...(b.category ? [{ '@type': 'ListItem', position: 3, name: b.category.name, item: `https://guzellikadresin.com/kategori/${b.category.slug}` }] : []),
      { '@type': 'ListItem', position: 4, name: b.name },
    ],
  };
  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="ga-biz-wrap">
        <BackButton />
        {/* breadcrumb */}
        <div className="ga-biz-crumb">
          <a href="/">Ana Sayfa</a> ›{' '}
          {b.province && <><a href={`/${b.province.slug}`}>{b.province.name}</a> › </>}
          {b.category && <a href={`/kategori/${b.category.slug}`}>{b.category.name}</a>}
        </div>
        <div className="ga-biz-grid">
          {/* SOL: içerik */}
          <div>
            <div className="ga-biz-head">
              <h1>{b.name}</h1>
              <div className="ga-biz-meta">
                {b.category && <span className="ga-biz-cat">{b.category.emoji} {b.category.name}</span>}
                <span className="ga-biz-loc">📍 {loc}</span>
              </div>
            </div>
            <Gallery images={b.gallery} alt={b.name} />
            {b.description && (
              <section className="ga-biz-sec">
                <h2>Hakkında</h2>
                <p>{b.description}</p>
              </section>
            )}
            {b.services.length > 0 && (
              <section className="ga-biz-sec">
                <h2>Sunulan Hizmetler</h2>
                <div className="ga-chips">
                  {b.services.map((s, i) => <span key={i} className="ga-tag">{s}</span>)}
                </div>
              </section>
            )}
            {b.works.length > 0 && (
              <section className="ga-biz-sec">
                <h2>Örnek Çalışmalar</h2>
                <div className="ga-works">
                  {b.works.map((src, i) => (
                    <div key={i} className="ga-work">
                      <Image src={src} alt={`${b.name} çalışma ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="(max-width:880px) 50vw, 200px" />
                    </div>
                  ))}
                </div>
              </section>
            )}
   <section className="ga-biz-sec">
              <h2>Konum</h2>
              {b.address && <p className="ga-biz-addr">📍 {b.address}{loc ? `, ${loc}` : ''}</p>}
              {b.lat && b.lng ? (
                <>
                  <LocationMap center={{ lat: b.lat, lng: b.lng }} readonly />
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`}
                    target="_blank"
                    rel="noopener"
                    className="ga-directions-btn"
                  >
                    🧭 Yol Tarifi Al
                  </a>
                </>
              ) : (
                <>
                  <div className="ga-map-ph">Konum bilgisi eklenmemiş</div>
                  {(b.address || loc) && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([b.address, loc].filter(Boolean).join(', '))}`}
                      target="_blank"
                      rel="noopener"
                      className="ga-directions-btn"
                    >
                      🧭 Haritada Ara
                    </a>
                  )}
                </>
              )}
            </section>
          </div>
          {/* SAĞ: iletişim kartı */}
          <aside className="ga-biz-contact">
            <BusinessContact
              businessId={b.id}
              name={b.name}
              slug={b.slug}
              phone={b.phone}
              whatsapp={b.whatsapp}
              website={b.website}
              instagram={b.instagram}
              facebook={b.facebook}
              x_twitter={b.x_twitter}
              linkedin={b.linkedin}
              randevuAktif={b.randevu_aktif}
              staffCount={b.staff_count}
              showPrice={b.show_price}
            />
            <a href="/isletme-ekle" className="ga-own-cta">Bu sizin işletmeniz mi? <b>Ücretsiz ekleyin →</b></a>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
