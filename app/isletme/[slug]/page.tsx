import { notFound } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import BackButton from '@/components/BackButton';
import BusinessContact from '@/components/BusinessContact';
import { getBusinessBySlug } from '@/lib/queries-business';
import { getBusinessList } from '@/lib/queries-list';
import { abs, ldJson, fitTitle, clampDesc, joinTr, trLower, catSeo, breadcrumbSchema } from '@/lib/seo';
const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false });
export const revalidate = 600;
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const b = await getBusinessBySlug(params.slug);
  if (!b) return { title: 'İşletme bulunamadı', robots: { index: false } };
  const loc = [b.district?.name, b.province?.name].filter(Boolean).join(', ');
  const area = b.district?.name || b.province?.name || '';
  // İsim zaten ilçeyi içeriyorsa tekrar etme ("Meditouch Beylikdüzü")
  const head = area && !trLower(b.name).includes(trLower(area)) ? `${b.name} ${area}` : b.name;
  const kat = b.category?.name || '';
  const contact = b.phone ? 'Adres ve Telefon' : 'Adres ve Yol Tarifi';
  const title = fitTitle([
    kat ? `${head}: ${kat}, ${contact}` : '',
    `${head}: ${contact}`,
    kat ? `${head} - ${kat}` : '',
    head,
    b.name,
  ]);

  // Açıklamada sadece sayfada gerçekten olanları say
  const feats = [
    b.address || loc ? 'adres' : '',
    b.phone ? 'telefon' : '',
    b.whatsapp ? 'WhatsApp' : '',
    b.lat && b.lng ? 'harita ve yol tarifi' : b.address || loc ? 'harita' : '',
    b.gallery.length + b.works.length > 0 ? 'fotoğraflar' : '',
  ].filter(Boolean);
  const featText = feats.length ? `${joinTr(feats).replace(/^./, (c) => c.toLocaleUpperCase('tr-TR'))} bu sayfada.` : '';
  const svc = b.services.length ? ` Hizmetler: ${b.services.slice(0, 4).map(trLower).join(', ')}.` : '';
  const description = clampDesc(
    `${b.name} – ${[kat, [b.district?.name, b.province?.name].filter(Boolean).join(' / ')].filter(Boolean).join(', ')}. ${featText}${svc}${!svc && b.description ? ` ${b.description}` : ''}`
  );
  const canonical = abs(`/isletme/${b.slug}`);
  const ogTitle = typeof title === 'string' ? title : title.absolute;
  const images = b.coverUrl ? [{ url: b.coverUrl, alt: b.name }] : [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GüzellikAdresin' }];
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: ogTitle, description, url: canonical, type: 'website', siteName: 'GüzellikAdresin', locale: 'tr_TR', images },
    twitter: { card: 'summary_large_image', title: ogTitle, description, images: images.map((i) => i.url) },
  };
}
export default async function BusinessPage({ params }: { params: { slug: string } }) {
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
  // Breadcrumb: Ana Sayfa > İl > İlçe > İlçe+Kategori > İşletme
  const comboPath = b.province && b.district && b.category ? `/${b.province.slug}/${b.district.slug}/${b.category.slug}` : null;
  const catSeoInfo = b.category ? catSeo(b.category.slug, b.category.name) : null;
  const crumbs = [
    { name: 'Ana Sayfa', path: '/' },
    ...(b.province ? [{ name: b.province.name, path: `/${b.province.slug}` }] : []),
    ...(b.province && b.district ? [{ name: b.district.name, path: `/${b.province.slug}/${b.district.slug}` }] : []),
    ...(b.category
      ? [comboPath
          ? { name: `${b.district!.name} ${catSeoInfo!.plural}`, path: comboPath }
          : { name: b.category.name, path: `/kategori/${b.category.slug}` }]
      : []),
    { name: b.name, path: `/isletme/${b.slug}` },
  ];
  const breadcrumb = { '@context': 'https://schema.org', ...breadcrumbSchema(crumbs) };

  // İç linkler: aynı kategori, aynı ilçe ve aynı il
  const [sameDistrict, sameProvince] = b.category_id
    ? await Promise.all([
        b.district_id ? getBusinessList({ categoryId: b.category_id, districtId: b.district_id, page: 1 }) : Promise.resolve(null),
        b.province_id ? getBusinessList({ categoryId: b.category_id, provinceId: b.province_id, page: 1 }) : Promise.resolve(null),
      ])
    : [null, null];
  const nearSame = (sameDistrict?.items || []).filter((x) => x.slug !== b.slug).slice(0, 6);
  const nearSlugs = new Set(nearSame.map((x) => x.slug).concat(b.slug));
  const provSame = (sameProvince?.items || []).filter((x) => !nearSlugs.has(x.slug)).slice(0, 6);

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(breadcrumb) }} />

      <div className="ga-biz-wrap">
        <BackButton />
        {/* breadcrumb */}
        <div className="ga-biz-crumb">
          <a href="/">Ana Sayfa</a> ›{' '}
          {b.province && <><a href={`/${b.province.slug}`}>{b.province.name}</a> › </>}
          {b.province && b.district && <><a href={`/${b.province.slug}/${b.district.slug}`}>{b.district.name}</a> › </>}
          {b.category && <a href={comboPath || `/kategori/${b.category.slug}`}>{b.category.name}</a>}
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
            {b.category && b.province && (nearSame.length > 0 || provSame.length > 0 || comboPath) && (
              <section className="ga-biz-sec">
                <h2>Yakındaki {catSeoInfo!.plural}</h2>
                {nearSame.length > 0 && (
                  <ul style={{ paddingLeft: 20, margin: '0 0 10px', lineHeight: 1.8 }}>
                    {nearSame.map((x) => (
                      <li key={x.slug}><a href={`/isletme/${x.slug}`}>{x.name}</a>{x.district_name ? ` · ${x.district_name}` : ''}</li>
                    ))}
                  </ul>
                )}
                {provSame.length > 0 && (
                  <ul style={{ paddingLeft: 20, margin: '0 0 10px', lineHeight: 1.8 }}>
                    {provSame.map((x) => (
                      <li key={x.slug}><a href={`/isletme/${x.slug}`}>{x.name}</a>{x.district_name ? ` · ${x.district_name}` : ''}</li>
                    ))}
                  </ul>
                )}
                <div className="ga-chips">
                  {comboPath && <a href={comboPath} className="ga-tag">Tüm {b.district!.name} {trLower(catSeoInfo!.plural)}</a>}
                  <a href={`/kategori/${b.category.slug}?il=${b.province.slug}`} className="ga-tag">{b.province.name} {trLower(catSeoInfo!.plural)}</a>
                  {b.district && <a href={`/${b.province.slug}/${b.district.slug}`} className="ga-tag">{b.district.name} güzellik merkezleri</a>}
                </div>
              </section>
            )}
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
