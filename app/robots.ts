import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

// Arama ve AI tarayıcıları: hepsi aynı kurallarla açıkça izinli
const AI_AND_SEARCH_BOTS = [
  'Googlebot',
  'Bingbot',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
];

// İndekslenmemesi gereken (giriş gerektiren / arama sonucu) yollar
const DISALLOW = ['/panel', '/giris', '/kayit', '/api/'];
// Not: /ara bilerek engellenmedi; sayfa noindex, Google bunu görebilmeli.

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url || 'https://guzellikadresin.com';

  // Indeksleme kapalıysa her şeyi engelle
  if (!siteConfig.allowIndexing) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_AND_SEARCH_BOTS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
