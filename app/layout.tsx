import type { Metadata } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { siteConfig } from '@/lib/siteConfig';
import MobileNav from '@/components/MobileNav';
import './globals.css';

const GA_ID = 'G-42528XZBLG';

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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={jakarta.variable}>
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
          </>
        )}
      </body>
    </html>
  );
}
