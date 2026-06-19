// ============================================================
// SITE CONFIG — Markanın tek kontrol noktası
// İsim/başlık/meta değiştirmek istersen SADECE burayı düzenle.
// ============================================================

export const siteConfig = {
  // Marka
  brandName: 'GüzellikAdresin',
  // Yan marka adı (insanlar "GüzellikAdresi" diye de arayabilir)
  alternateName: 'GüzellikAdresi',

  title: 'Bölgendeki Güzellik ve Bakım Merkezlerini Bul | GüzellikAdresin',
  description:
    'GüzellikAdresin (GüzellikAdresi) ile yakınındaki en iyi güzellik adresini bul. Güzellik merkezi, lazer epilasyon, saç ekimi, kuaför, tırnak, kalıcı makyaj ve daha fazlası — Türkiye genelinde tüm il ve ilçelerde adresleri, telefonları ve konumlarıyla tek yerde, ücretsiz.',

  // SEO anahtar kelimeler (meta + AI taban)
  keywords: [
    'güzellik adresin',
    'güzellik adresi',
    'güzellikadresin',
    'güzellikadresi',
    'güzellik merkezi',
    'güzellik merkezi bul',
    'yakınımdaki güzellik merkezi',
    'bölgemdeki güzellik merkezi',
    'güzellik salonu',
    'kuaför',
    'bayan kuaförü',
    'erkek kuaförü',
    'lazer epilasyon',
    'saç ekimi',
    'medikal estetik',
    'tırnak studyosu',
    'protez tırnak',
    'kalıcı makyaj',
    'microblading',
    'spa masaj',
    'cilt bakımı',
    'güzellik ve bakım rehberi',
    'Türkiye güzellik merkezi',
  ],

  // Türkiye geneli (AI ve schema için)
  areaServed: 'Türkiye',

  // Renkler (marka kimliği)
  colors: {
    navy: '#0e2148',
    gold: '#c9a24b',
  },

  // SEO: Google'ın siteyi indekslemesi
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true',

  // Site adresi (env'den; yoksa boş)
  url: process.env.NEXT_PUBLIC_SITE_URL || '',

  // İletişim
  email: '',
  formspreeId: 'maqzvwoy',

  // Sosyal medya
  social: {
    instagram: '',
    facebook: '',
  },
};

export type SiteConfig = typeof siteConfig;
