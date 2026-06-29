import type { Metadata } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { siteConfig } from '@/lib/siteConfig';
import MobileNav from '@/components/MobileNav';
import './globals.css';

const GA_ID = 'G-42528XZBLG';
// Meta (Facebook) Pixel ID — Meta Events Manager'dan aldığın ID'yi buraya yaz
const META_PIXEL_ID = '500558535934647';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.brandName,
  // Google indekslemesi: env false ise siteyi gizle (geçici subdomain)
  robots: siteConfig.allowIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false },
  verification: {
    google: 'EGmSKxrHUFZx_OuPsiB_3w8NJfLxpxwFeG64hfM573o',
    other: {
      'msvalidate.01': '9CB03E8E93C7289160D5677D71AB3ACB',
    },
  },
  ...(siteConfig.url ? { metadataBase: new URL(siteConfig.url) } : {}),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: 'website',
    locale: 'tr_TR',
    siteName: siteConfig.brandName,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: siteConfig.brandName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const base = siteConfig.url || 'https://guzellikadresin.com';

  // Organization + WebSite schema (Google + AI taban)
  // alternateName ile "GüzellikAdresi" diye arayan da markayı bulur.
  const orgSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: siteConfig.brandName,
        alternateName: [siteConfig.alternateName, 'güzellik adresin', 'güzellik adresi'],
        url: base,
        logo: `${base}/og-image.png`,
        description: siteConfig.description,
        areaServed: {
          '@type': 'Country',
          name: siteConfig.areaServed,
        },
        knowsAbout: [
          'Güzellik merkezi',
          'Medikal estetik',
          'Bayan kuaförü',
          'Erkek kuaförü',
          'Tırnak studyosu',
          'Spa ve masaj',
          'Kalıcı makyaj',
          'Saç ekimi',
          'Solaryum',
          'Dövme ve piercing',
          'Zayıflama ve bölgesel incelme',
          'Sauna',
          'Pilates',
          'Lazer epilasyon',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        name: siteConfig.brandName,
        alternateName: siteConfig.alternateName,
        url: base,
        description: siteConfig.description,
        inLanguage: 'tr-TR',
        publisher: { '@id': `${base}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${base}/ara?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="tr" className={jakarta.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body>
        {children}
        <MobileNav />
        {siteConfig.allowIndexing && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>

            {/* Meta (Facebook) Pixel */}
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}
