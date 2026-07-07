// ============================================================
//  RANDEVU — HAZIR HİZMET ŞABLONLARI (kategori slug bazlı)
//  İşletme kategorisine göre otomatik yüklenir, sonra düzenlenebilir.
//  type: classic (fiyat gösterilebilir) / consult (fiyat gizli, ön görüşme)
//        / session (seans paketi) / walkin (randevusuz opsiyonel)
// ============================================================

export type TemplateService = { name: string; duration_min: number; price: number | null };
export type CategoryTemplate = {
  type: 'classic' | 'consult' | 'session' | 'walkin';
  services: TemplateService[];
};

// Anahtar = categories tablosundaki slug
export const APPOINTMENT_TEMPLATES: Record<string, CategoryTemplate> = {
  'bayan-kuaforu': {
    type: 'classic',
    services: [
      { name: 'Saç Kesim', duration_min: 30, price: 150 },
      { name: 'Fön', duration_min: 30, price: 100 },
      { name: 'Saç Boyama', duration_min: 90, price: 500 },
      { name: 'Röfle / Ombre', duration_min: 150, price: 900 },
      { name: 'Keratin Bakımı', duration_min: 120, price: 800 },
      { name: 'Topuz / Gelin Saçı', duration_min: 60, price: 600 },
    ],
  },
  'erkek-kuaforu': {
    type: 'classic',
    services: [
      { name: 'Saç Kesim', duration_min: 30, price: 120 },
      { name: 'Sakal Tıraşı', duration_min: 20, price: 60 },
      { name: 'Saç + Sakal', duration_min: 45, price: 160 },
      { name: 'Çocuk Saç', duration_min: 20, price: 80 },
      { name: 'Ağda', duration_min: 15, price: 50 },
    ],
  },
  'guzellik-merkezi': {
    type: 'classic',
    services: [
      { name: 'Cilt Bakımı', duration_min: 60, price: 400 },
      { name: 'Hydrafacial', duration_min: 60, price: 700 },
      { name: 'Kaş Tasarımı', duration_min: 30, price: 150 },
      { name: 'İpek Kirpik', duration_min: 90, price: 600 },
      { name: 'Ağda / Sir', duration_min: 45, price: 250 },
    ],
  },
  'tirnak-studyosu': {
    type: 'classic',
    services: [
      { name: 'Manikür', duration_min: 45, price: 200 },
      { name: 'Pedikür', duration_min: 60, price: 250 },
      { name: 'Protez Tırnak', duration_min: 90, price: 500 },
      { name: 'Kalıcı Oje', duration_min: 45, price: 250 },
      { name: 'Nail Art', duration_min: 60, price: 350 },
    ],
  },
  'medikal-estetik': {
    type: 'consult',
    services: [
      { name: 'Ön Görüşme', duration_min: 30, price: null },
      { name: 'Botoks', duration_min: 30, price: null },
      { name: 'Dolgu', duration_min: 45, price: null },
      { name: 'Mezoterapi', duration_min: 45, price: null },
      { name: 'Leke Tedavisi', duration_min: 45, price: null },
    ],
  },
  'kalici-makyaj': {
    type: 'consult',
    services: [
      { name: 'Ön Görüşme', duration_min: 30, price: null },
      { name: 'Microblading', duration_min: 120, price: null },
      { name: 'Dudak Renklendirme', duration_min: 120, price: null },
      { name: 'Eyeliner', duration_min: 90, price: null },
      { name: 'Rötuş', duration_min: 60, price: null },
    ],
  },
  'spa-masaj': {
    type: 'classic',
    services: [
      { name: 'İsveç Masajı', duration_min: 60, price: 600 },
      { name: 'Medikal Masaj', duration_min: 60, price: 700 },
      { name: 'Aroma Terapi', duration_min: 90, price: 800 },
      { name: 'Sıcak Taş Masajı', duration_min: 90, price: 900 },
      { name: 'Refleksoloji', duration_min: 45, price: 500 },
    ],
  },
  'dovme-piercing': {
    type: 'consult',
    services: [
      { name: 'Ön Görüşme', duration_min: 30, price: null },
      { name: 'Küçük Dövme', duration_min: 60, price: null },
      { name: 'Orta Dövme', duration_min: 120, price: null },
      { name: 'Piercing', duration_min: 20, price: null },
    ],
  },
  'sac-ekimi': {
    type: 'consult',
    services: [
      { name: 'Ön Görüşme / Analiz', duration_min: 45, price: null },
      { name: 'Saç Simülasyonu (SMP)', duration_min: 180, price: null },
      { name: 'PRP / Mezoterapi', duration_min: 45, price: null },
      { name: 'Kontrol', duration_min: 20, price: null },
    ],
  },
  'zayiflama-bolgesel-incelme': {
    type: 'session',
    services: [
      { name: 'Ön Görüşme', duration_min: 30, price: null },
      { name: 'G5 Masajı', duration_min: 45, price: 300 },
      { name: 'Bölgesel İncelme Seansı', duration_min: 60, price: 400 },
      { name: 'Kavitasyon', duration_min: 60, price: 450 },
    ],
  },
  'solaryum': {
    type: 'walkin',
    services: [
      { name: 'Solaryum Seansı', duration_min: 15, price: 80 },
      { name: 'Ekspres', duration_min: 10, price: 60 },
    ],
  },
  'sauna': {
    type: 'walkin',
    services: [
      { name: 'Sauna Seansı', duration_min: 60, price: 200 },
      { name: 'Özel Kabin', duration_min: 90, price: 400 },
    ],
  },
  'pilates': {
    type: 'session',
    services: [
      { name: 'Reformer Dersi', duration_min: 50, price: 400 },
      { name: 'Mat Pilates', duration_min: 50, price: 300 },
      { name: 'Özel Ders', duration_min: 60, price: 600 },
      { name: 'Grup Dersi', duration_min: 50, price: 250 },
    ],
  },
};

export const TYPE_NOTES: Record<string, string> = {
  consult:
    '⚠️ Konsültasyon: fiyat ön görüşme sonrası belli olur, gizli tutman önerilir. Müşteri önce "Ön Görüşme" alır.',
  session:
    '💡 Seans paketi mantığı. Sistem tek randevu alır, paketi yüz yüze satarsın.',
  walkin:
    '💡 Genelde randevusuz "gel-kullan". Randevu opsiyonel — yoğun saatte yer ayırtma için.',
  classic: '✅ Klasik randevu: hizmet + süre + saat. Tam uyumlu.',
};
