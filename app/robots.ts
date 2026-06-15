import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url || 'https://guzellikadresin.com';

  // Indeksleme kapalıysa her şeyi engelle
  if (!siteConfig.allowIndexing) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/panel', '/giris', '/kayit'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
