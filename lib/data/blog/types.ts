export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;        // liste/kart için kısa özet
  heroImage: string;      // Unsplash URL
  category: string;       // konu etiketi (örn. "Lazer Epilasyon")
  audience: 'kullanici' | 'isletme';
  readMinutes: number;
  publishedAt: string;    // ISO tarih
  faq: { q: string; a: string }[];  // FAQPage schema için
  // İçerik HTML string (paragraf, h2, ul, iç linkler). Marka ismi GEÇMEZ.
  contentHtml: string;
};
