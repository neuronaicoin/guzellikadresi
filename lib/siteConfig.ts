// ============================================================
// SITE CONFIG — Markanın tek kontrol noktası
// İsim/başlık/meta değiştirmek istersen SADECE burayı düzenle.
// (İleride "Este10"a geçmek istersen brandName'i değiştir, biter.)
// ============================================================

export const siteConfig = {
  // Marka
  brandName: 'GüzellikAdresi',
  title: 'GüzellikAdresi — Güzelliğin Doğru Adresi',
  description:
    "Türkiye'nin güzellik ve bakım adresi. Yakınınızdaki güzellik merkezi, kuaför, berber, medikal estetik, tırnak stüdyosu, saç ekimi ve daha fazlasını ücretsiz bulun, karşılaştırın, ulaşın.",

  // Renkler (marka kimliği)
  colors: {
    navy: '#0e2148',
    gold: '#c9a24b',
  },

  // SEO: Google'ın siteyi indekslemesi
  // Railway geçici subdomain'de FALSE (Google girmesin),
  // gerçek domain bağlanınca env'den TRUE yapılır.
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true',

  // Site adresi (env'den; yoksa boş)
  url: process.env.NEXT_PUBLIC_SITE_URL || '',

  // İletişim
  email: '',           // sonra eklenecek
  formspreeId: '',     // Formspree form ID'si (contact için, sonra)

  // Sosyal medya (lansmanda doldurulacak)
  social: {
    instagram: '',
    facebook: '',
  },
};

export type SiteConfig = typeof siteConfig;
