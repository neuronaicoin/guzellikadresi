import { notFound } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import { getBusinessBySlug } from '@/lib/queries-business';

const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false });

export const revalidate = 600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const b = await getBusinessBySlug(params.slug);
  if (!b) return { title: 'İşletme bulunamadı' };
  const loc = [b.district?.name, b.province?.name].filter(Boolean).join(', ');
  return {
    title: `${b.name} — ${loc}`,
    description: b.description || `${b.name}, ${loc}. ${b.category?.name || ''} hizmetleri. GüzellikAdresi'nde keşfedin.`,
  };
}

export default async function BusinessPage({ params }: { params: { slug: string } }) {
  const b = await getBusinessBySlug(params.slug);
  if (!b) notFound();

  const loc = [b.district?.name, b.province?.name].filter(Boolean).join(', ');

  // LocalBusiness schema (Google zengin sonuç)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: b.name,
    description: b.description || undefined,
    image: b.coverUrl || undefined,
    telephone: b.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address || undefined,
      addressLocality: b.district?.name || undefined,
      addressRegion: b.province?.name || undefined,
      addressCountry: 'TR',
    },
    ...(b.lat && b.lng ? { geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng } } : {}),
    ...(b.website ? { url: b.website } : {}),
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="ga-biz-wrap">
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
                <LocationMap center={{ lat: b.lat, lng: b.lng }} readonly />
              ) : (
                <div className="ga-map-ph">Konum bilgisi eklenmemiş</div>
              )}
            </section>
          </div>

          {/* SAĞ: iletişim kartı */}
          <aside className="ga-biz-contact">
            <div className="ga-contact-card">
              <h3>İletişim</h3>
              {b.phone && <a href={`tel:${b.phone}`} className="ga-c-btn ga-c-call">📞 {b.phone}</a>}
              {b.whatsapp && <a href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" className="ga-c-btn ga-c-wa">💬 WhatsApp</a>}
              {b.website && <a href={b.website} target="_blank" rel="noopener" className="ga-c-btn ga-c-web">🌐 Web Sitesi</a>}
              <div className="ga-socials">
                {b.instagram && <a href={normalizeSocial(b.instagram, 'instagram')} target="_blank" rel="noopener">Instagram</a>}
                {b.facebook && <a href={normalizeSocial(b.facebook, 'facebook')} target="_blank" rel="noopener">Facebook</a>}
                {b.x_twitter && <a href={normalizeSocial(b.x_twitter, 'x')} target="_blank" rel="noopener">X</a>}
                {b.linkedin && <a href={normalizeSocial(b.linkedin, 'linkedin')} target="_blank" rel="noopener">LinkedIn</a>}
              </div>
            </div>
            <a href="/isletme-ekle" className="ga-own-cta">Bu sizin işletmeniz mi? <b>Ücretsiz ekleyin →</b></a>
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}

function normalizeSocial(val: string, type: string): string {
  const v = val.trim();
  if (v.startsWith('http')) return v;
  const handle = v.replace(/^@/, '');
  switch (type) {
    case 'instagram': return `https://instagram.com/${handle}`;
    case 'facebook': return `https://facebook.com/${handle}`;
    case 'x': return `https://x.com/${handle}`;
    case 'linkedin': return v.includes('/') ? `https://${v.replace(/^https?:\/\//, '')}` : `https://linkedin.com/company/${handle}`;
    default: return v;
  }
}
