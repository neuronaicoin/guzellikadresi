// ============================================================
// SEO yardımcıları: kanonik adres, başlık/açıklama sığdırma,
// JSON-LD, kategoriye özel ipuçları + SSS, ilgili rehber yazıları
// ============================================================
import { getAllPosts } from '@/lib/data/blog';
import type { BlogPost } from '@/lib/data/blog/types';

export const SITE = 'https://guzellikadresin.com';
const BRAND_SUFFIX = ' | GüzellikAdresin'; // app/layout.tsx title template
const MAX_TITLE = 60;

export const abs = (path: string) => (path.startsWith('http') ? path : `${SITE}${path.startsWith('/') ? path : `/${path}`}`);

// Sayfa openGraph'ı layout'unkini tamamen ezdiği için varsayılan görsel
export const OG_IMAGES = [{ url: 'https://guzellikadresin.com/og-image.png', width: 1200, height: 630, alt: 'GüzellikAdresin' }];

export const trLower = (s: string) => s.toLocaleLowerCase('tr-TR');

// JSON-LD'yi güvenli şekilde gömmek için
export const ldJson = (obj: unknown) => JSON.stringify(obj).replace(/</g, '\\u003c');

/**
 * Aday başlıklardan ilk uygun olanı seçer.
 * Marka eki ile 60 karaktere sığıyorsa template kullanılır, sığmıyorsa
 * markasız (absolute) başlık döner. Hiçbiri sığmazsa son aday kısaltılır.
 */
export function fitTitle(candidates: string[]): string | { absolute: string } {
  const clean = candidates.map((c) => c.replace(/\s+/g, ' ').trim()).filter(Boolean);
  for (const c of clean) if (c.length + BRAND_SUFFIX.length <= MAX_TITLE) return c;
  for (const c of clean) if (c.length <= MAX_TITLE) return { absolute: c };
  const last = clean[clean.length - 1] || '';
  return { absolute: last.slice(0, MAX_TITLE - 1).replace(/\s+\S*$/, '') + '…' };
}

// Açıklamayı ~160 karaktere kelime sınırında kısalt
export function clampDesc(s: string, max = 160): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).replace(/[\s,;:–-]+\S*$/, '');
  return cut.replace(/[,;:]$/, '') + '…';
}

// "A, B ve C"
export function joinTr(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ve ${items[items.length - 1]}`;
}

// ------------------------------------------------------------
// Kategori içerik haritası
// ------------------------------------------------------------
type Faq = { q: string; a: string };
type CatSeo = {
  plural: string; // "Lazer Epilasyon Merkezleri"
  tips: string; // seçerken sorulacaklar
  faqs: Faq[]; // {loc} yer tutucusu desteklenir
  related: string[]; // ilgili kategori slug'ları
};

const reachFaq = (label: string): Faq => ({
  q: `{loc} ${label} nasıl bulunur ve iletişime geçilir?`,
  a: `Bu sayfada listelenen işletmeleri inceleyebilir, il ve ilçeye göre size en yakın olanları görebilirsiniz. Her işletme sayfasında adres ve konum bilgisi, işletme eklediyse telefon, WhatsApp ve web sitesi bağlantıları yer alır; doğrudan iletişime geçebilirsiniz.`,
});

export const CATEGORY_SEO: Record<string, CatSeo> = {
  'lazer-epilasyon': {
    plural: 'Lazer Epilasyon Merkezleri',
    tips: 'Lazer epilasyon merkezi seçerken kullanılan cihazın tipini (alexandrite, diyot/buz lazer, Nd:YAG) ve cilt-tüy tipinize uygunluğunu, önerilen seans sayısını ve aralığını, uygulamanın doktor kontrolünde yapılıp yapılmadığını ve paket fiyatına nelerin dahil olduğunu sorun.',
    faqs: [
      { q: 'Lazer epilasyon kaç seans sürer?', a: 'Çoğu kişide kalıcı sonuç için 6-10 seans gerekir; seanslar bölgeye göre genellikle 4-8 hafta arayla planlanır. Tüy yapısı, cilt tipi ve hormonal durum seans sayısını etkiler.' },
      { q: '{loc} lazer epilasyon merkezi seçerken nelere dikkat etmeliyim?', a: 'Cihazın tipini ve markasını, uygulamayı yapan kişinin eğitimini, merkezin doktor kontrolünde çalışıp çalışmadığını ve ön görüşmede cilt-tüy analizi yapılıp yapılmadığını sorun.' },
      { q: 'Hangi lazer cihazı daha iyi?', a: 'Herkes için tek bir en iyi cihaz yoktur. Alexandrite genellikle açık tenlerde, diyot (buz lazer) geniş bir cilt aralığında, Nd:YAG ise koyu tenlerde tercih edilir. Size uygun olanı ön görüşmede uzmanla netleştirin.' },
      { q: 'Lazer epilasyon öncesi nelere dikkat edilmeli?', a: 'Uygulamadan önceki haftalarda güneşlenmeyin, ağda ve cımbız kullanmayın; bölgeyi bir gün önce tıraş edin. Kullandığınız ilaçları ve cilt hassasiyetlerinizi uzmana bildirin.' },
    ],
    related: ['guzellik-merkezi', 'medikal-estetik', 'zayiflama-bolgesel-incelme'],
  },
  'sac-ekimi': {
    plural: 'Saç Ekimi Merkezleri',
    tips: 'Saç ekimi için merkez seçerken operasyonu kimin yapacağını (doktor ve ekip), kuruluşun Sağlık Bakanlığı ruhsatı ve yetkisini, planlanan greft sayısını ve tekniği (FUE, DHI), operasyon sonrası kontrol ve yıkama sürecini mutlaka sorun.',
    faqs: [
      { q: 'Saç ekimi için kaç greft gerekir?', a: 'Greft sayısı açıklık alanının büyüklüğüne ve donör bölgenin yoğunluğuna göre belirlenir; kesin sayı ancak doktor muayenesinden sonra planlanabilir.' },
      { q: 'Saç ekimini kim yapmalı?', a: 'Saç ekimi tıbbi bir işlemdir; Sağlık Bakanlığı tarafından yetkilendirilmiş sağlık kuruluşlarında, doktor sorumluluğunda yapılmalıdır. Operasyonu kimin yapacağını önceden öğrenin.' },
      { q: 'FUE ile DHI arasındaki fark nedir?', a: 'Her iki yöntemde de greftler tek tek alınır. FUE\'de kanallar önceden açılır; DHI\'da greftler özel bir implanter kalemle kanal açılırken yerleştirilir. Hangisinin uygun olduğuna doktor karar verir.' },
      { q: 'Saç ekimi sonrası sonuç ne zaman görülür?', a: 'Ekilen saçlar ilk haftalarda dökülebilir (şok dökülme). Yeni çıkış genellikle 3-4. aydan itibaren başlar, belirgin sonuç çoğunlukla 9-12 ayda görülür.' },
    ],
    related: ['medikal-estetik', 'erkek-kuaforu', 'guzellik-merkezi'],
  },
  'medikal-estetik': {
    plural: 'Medikal Estetik Merkezleri',
    tips: 'Botoks, dolgu ve mezoterapi gibi enjeksiyon uygulamalarının doktor tarafından yapılıp yapılmadığını, kullanılacak ürünün marka ve orijinalliğini, uygulama sonrası kontrol randevusunu ve olası yan etkileri önceden sorun.',
    faqs: [
      { q: 'Medikal estetik uygulamalarını kim yapabilir?', a: 'Botoks ve dolgu gibi enjeksiyonlar tıbbi uygulamalardır; doktor tarafından ve uygun koşullarda yapılmalıdır.' },
      { q: 'Botoks ile dolgu arasındaki fark nedir?', a: 'Botoks kasları geçici olarak gevşeterek mimik çizgilerini azaltır. Dolgu (çoğunlukla hyaluronik asit) ise hacim kaybını ve derin çizgileri doldurmak için kullanılır.' },
      { q: '{loc} medikal estetik merkezinde uygulama öncesi ne sormalıyım?', a: 'Uygulamayı kimin yapacağını, kullanılacak ürünün markasını ve orijinalliğini, beklenen etki süresini, olası yan etkileri ve kontrol randevusunu sorun.' },
    ],
    related: ['guzellik-merkezi', 'lazer-epilasyon', 'sac-ekimi'],
  },
  'guzellik-merkezi': {
    plural: 'Güzellik Merkezleri',
    tips: 'Güzellik merkezi seçerken sunulan hizmetleri, kullanılan cihaz ve ürünleri, hijyen koşullarını ve personelin sertifikalarını sorun; cilt bakımı ve lazer gibi uygulamalarda ilk seanstan önce cilt analizi yapılıp yapılmadığını kontrol edin.',
    faqs: [
      { q: 'Güzellik merkezinde hangi hizmetler bulunur?', a: 'Çoğu güzellik merkezinde cilt bakımı, ağda, lazer epilasyon, kaş-kirpik uygulamaları, manikür-pedikür ve bölgesel incelme gibi hizmetler bulunur; kapsam merkeze göre değişir. İşletme sayfalarında sunulan hizmetleri görebilirsiniz.' },
      { q: 'Güzellik merkezi seçerken nelere dikkat etmeliyim?', a: 'Hijyen, personelin eğitim ve sertifikaları, cihazların ruhsatlı olması ve ön görüşmede ihtiyacınıza göre net bilgi verilmesi önemli göstergelerdir.' },
      reachFaq('güzellik merkezleri'),
    ],
    related: ['lazer-epilasyon', 'medikal-estetik', 'tirnak-studyosu'],
  },
  'bayan-kuaforu': {
    plural: 'Bayan Kuaförleri',
    tips: 'Bayan kuaförü seçerken boya, röfle, keratin ve gelin saçı gibi işlemlerdeki deneyimi, kullanılan boya ve bakım ürünlerinin markasını, randevu düzenini ve önceki çalışma örneklerini inceleyin.',
    faqs: [
      { q: 'Kuaföre gitmeden önce randevu almak gerekir mi?', a: 'Boya, röfle ve keratin gibi uzun süren işlemler ile hafta sonu için randevu almak beklemeyi önler.' },
      { q: 'Saç boyatmadan önce ne sormalıyım?', a: 'Kullanılacak boyanın markasını, saçınıza daha önce yapılan işlemlerin sonuca etkisini ve gerekirse alerji (yama) testi yapılıp yapılmayacağını sorun.' },
      { q: '{loc} bayan kuaförlerinin çalışmalarını nereden görebilirim?', a: 'İşletme sayfalarında işletmenin eklediği fotoğraflar ve örnek çalışmalar yer alır; varsa sosyal medya hesaplarının bağlantıları da sayfada bulunur.' },
    ],
    related: ['tirnak-studyosu', 'guzellik-merkezi', 'kalici-makyaj'],
  },
  'erkek-kuaforu': {
    plural: 'Erkek Kuaförleri',
    tips: 'Erkek kuaförü seçerken saç ve sakal kesimindeki deneyimi, hijyeni (her müşteride yeni jilet, dezenfekte edilmiş makas ve tarak) ve randevu imkânını kontrol edin; istediğiniz kesim için örnek çalışmalara bakın.',
    faqs: [
      { q: 'Erkek kuaföründe hijyen için nelere dikkat etmeliyim?', a: 'Her müşteride yeni jilet kullanılmasına, makas ve tarak gibi ekipmanın dezenfekte edilmesine ve temiz havlu kullanılmasına dikkat edin.' },
      { q: 'Erkek kuaförü için randevu almak gerekli mi?', a: 'Yoğun saatlerde ve hafta sonlarında beklememek için randevu almak pratik olur; birçok işletme telefon veya WhatsApp üzerinden randevu verir.' },
      reachFaq('erkek kuaförleri'),
    ],
    related: ['sac-ekimi', 'bayan-kuaforu', 'spa-masaj'],
  },
  'tirnak-studyosu': {
    plural: 'Tırnak Stüdyoları',
    tips: 'Tırnak stüdyosu seçerken kullanılan ürünleri (jel, akrilik, kalıcı oje), metal aletlerin sterilizasyonunu, protez tırnağın nasıl çıkarıldığını ve önceki çalışma örneklerini sorun.',
    faqs: [
      { q: 'Protez tırnak doğal tırnağa zarar verir mi?', a: 'Doğru uygulanıp doğru çıkarıldığında risk azalır. Zararın büyük kısmı aşırı törpüleme veya tırnağı zorla sökmekten kaynaklanır; çıkarma işlemini stüdyoda yaptırın.' },
      { q: 'Kalıcı oje ne kadar dayanır?', a: 'Tırnak uzama hızına ve kullanıma bağlı olarak genellikle 2-3 hafta dayanır.' },
      { q: 'Tırnak stüdyosunda hijyen nasıl anlaşılır?', a: 'Metal aletlerin sterilize edildiğini ve törpü gibi tek kullanımlık malzemelerin her müşteride yenilendiğini sorabilirsiniz.' },
    ],
    related: ['bayan-kuaforu', 'guzellik-merkezi', 'kalici-makyaj'],
  },
  'spa-masaj': {
    plural: 'Spa ve Masaj Salonları',
    tips: 'Spa ve masaj salonu seçerken sunulan masaj türlerini (klasik, aromaterapi, derin doku vb.), terapistlerin eğitimini, seans süresini ve sağlık durumunuzun uygulamaya uygunluğunu önceden konuşun.',
    faqs: [
      { q: 'Hangi masaj türünü seçmeliyim?', a: 'Rahatlamak için klasik veya aromaterapi masajı, kas gerginliği için derin doku masajı sık tercih edilir. İhtiyacınızı terapiste anlatarak karar verebilirsiniz.' },
      { q: 'Masaj öncesi nelere dikkat etmeliyim?', a: 'Ağır bir yemekten hemen sonra gitmeyin; hamilelik, tansiyon, varis veya yakın zamanda geçirilmiş ameliyat gibi durumları önceden bildirin.' },
      reachFaq('spa ve masaj salonları'),
    ],
    related: ['sauna', 'guzellik-merkezi', 'zayiflama-bolgesel-incelme'],
  },
  'kalici-makyaj': {
    plural: 'Kalıcı Makyaj Uzmanları',
    tips: 'Kalıcı makyaj veya microblading için uzman seçerken eğitim sertifikasını, kullanılan pigmentin markasını, tek kullanımlık iğne kullanılıp kullanılmadığını, rötuş seansını ve önceki çalışma fotoğraflarını mutlaka inceleyin.',
    faqs: [
      { q: 'Kalıcı makyaj ne kadar kalır?', a: 'Cilt tipine ve bakıma bağlı olarak genellikle 1-3 yıl arası kalır; zamanla solar ve rötuş gerekir.' },
      { q: 'Microblading ile kalıcı kaş arasındaki fark nedir?', a: 'Microblading\'de manuel bir kalemle kıl görünümlü ince çizgiler oluşturulur; cihazla yapılan kalıcı kaşta ise daha pudralı veya dolgun bir görünüm elde edilir.' },
      { q: 'Kalıcı makyaj uzmanı seçerken nelere bakmalıyım?', a: 'Sertifika, steril ve tek kullanımlık iğne, pigment markası ve önceki çalışma örnekleri en önemli kriterlerdir.' },
    ],
    related: ['guzellik-merkezi', 'tirnak-studyosu', 'bayan-kuaforu'],
  },
  pilates: {
    plural: 'Pilates Stüdyoları',
    tips: 'Pilates stüdyosu seçerken eğitmen sertifikalarını, derslerin mat mı reformer mı olduğunu, grup büyüklüğünü ve sağlık durumunuza göre bireysel program sunulup sunulmadığını sorun.',
    faqs: [
      { q: 'Reformer pilates ile mat pilates arasındaki fark nedir?', a: 'Mat pilates vücut ağırlığıyla yerde yapılır; reformer pilatesta yaylı bir alet direnç ve destek sağlar, egzersizler kişiye göre daha kolay ayarlanabilir.' },
      { q: 'Pilatese başlamadan önce ne yapmalıyım?', a: 'Bel-boyun sorunu, hamilelik veya yakın zamanda geçirilmiş bir sakatlık varsa eğitmene bildirin; gerekirse önce doktorunuza danışın.' },
      reachFaq('pilates stüdyoları'),
    ],
    related: ['zayiflama-bolgesel-incelme', 'spa-masaj', 'sauna'],
  },
  'zayiflama-bolgesel-incelme': {
    plural: 'Bölgesel İncelme Merkezleri',
    tips: 'Bölgesel incelme uygulamalarında kullanılan cihazı ve yöntemi, önerilen seans sayısını ve sonuçların beslenme ve egzersizle nasıl destekleneceğini sorun; kesin kilo kaybı vaatlerine temkinli yaklaşın.',
    faqs: [
      { q: 'Bölgesel incelme ile kilo verilir mi?', a: 'Bölgesel incelme uygulamaları belirli bölgelerde çevre ölçüsü ve sıkılığı hedefler; kilo kaybı için tek başına yeterli değildir, beslenme ve egzersizle desteklenmelidir.' },
      { q: 'Bölgesel incelme kaç seans sürer?', a: 'Yönteme ve bölgeye göre değişir; ön görüşmede ölçüm yapılarak bir seans planı çıkarılması gerekir.' },
      { q: 'Bölgesel incelme kimler için uygun değildir?', a: 'Hamilelik, bazı kronik hastalıklar veya bölgede implant bulunması gibi durumlarda bazı cihazlar uygulanmayabilir; sağlık geçmişinizi mutlaka paylaşın.' },
    ],
    related: ['guzellik-merkezi', 'pilates', 'spa-masaj'],
  },
  solaryum: {
    plural: 'Solaryum Merkezleri',
    tips: 'Solaryum merkezinde cihazın bakımını, seans süresinin cilt tipinize göre ayarlanıp ayarlanmadığını ve göz koruyucu verilip verilmediğini sorun; sık kullanımın cilt sağlığı için risk taşıdığını unutmayın.',
    faqs: [
      { q: 'Solaryum zararlı mı?', a: 'Solaryum UV ışını kullanır; aşırı ve sık kullanım cilt yaşlanmasını hızlandırır ve cilt kanseri riskini artırır. 18 yaş altı ile açık ve hassas tenliler için önerilmez.' },
      { q: 'Solaryum seansı ne kadar sürmeli?', a: 'Cilt tipine göre kısa sürelerle başlanmalı ve seanslar arasında en az 48 saat bırakılmalıdır.' },
      { q: 'Solaryumda göz koruması gerekli mi?', a: 'Evet, UV koruyucu gözlük mutlaka kullanılmalıdır.' },
    ],
    related: ['guzellik-merkezi', 'spa-masaj', 'sauna'],
  },
  sauna: {
    plural: 'Sauna Merkezleri',
    tips: 'Sauna tercih ederken hijyeni, sıcaklık kontrolünü, duş ve dinlenme alanlarını sorun; kalp veya tansiyon rahatsızlığınız varsa önce doktorunuza danışın.',
    faqs: [
      { q: 'Saunada ne kadar kalınmalı?', a: 'Genellikle 10-15 dakikalık oturumlar önerilir; aralarda serinleyip su için.' },
      { q: 'Kimler sauna kullanmamalı?', a: 'Kalp-damar hastalığı, kontrolsüz tansiyon veya hamilelik durumunda doktora danışmadan sauna kullanılmamalıdır.' },
      { q: 'Sauna öncesi ve sonrası nelere dikkat edilmeli?', a: 'Bol su için, alkol almayın ve ağır bir yemekten hemen sonra saunaya girmeyin.' },
    ],
    related: ['spa-masaj', 'pilates', 'guzellik-merkezi'],
  },
  'dovme-piercing': {
    plural: 'Dövme ve Piercing Stüdyoları',
    tips: 'Dövme ve piercing stüdyosu seçerken tek kullanımlık iğne ve otoklav sterilizasyonunu, kullanılan mürekkebi ve takı malzemesini (titanyum, cerrahi çelik) ve sanatçının portfolyosunu inceleyin.',
    faqs: [
      { q: 'Dövme stüdyosunda hijyen nasıl anlaşılır?', a: 'İğnenin önünüzde açılan tek kullanımlık paketten çıkmasına, eldiven kullanılmasına ve aletlerin otoklavda sterilize edilmesine dikkat edin.' },
      { q: 'Piercing için hangi takı malzemesi uygundur?', a: 'İlk takıda implant sınıfı titanyum veya cerrahi çelik gibi alerji riski düşük malzemeler tercih edilir.' },
      { q: 'Dövme sonrası bakım nasıl yapılır?', a: 'Sanatçının verdiği bakım talimatlarını uygulayın; bölgeyi temiz tutun ve iyileşene kadar güneşten, havuz ve denizden koruyun.' },
    ],
    related: ['kalici-makyaj', 'guzellik-merkezi', 'erkek-kuaforu'],
  },
};

const DEFAULT_TIPS =
  'İşletme seçerken sunulan hizmetleri, uygulamayı yapan kişinin eğitim ve sertifikalarını, kullanılan ürün ve cihazları, hijyen koşullarını ve fiyata nelerin dahil olduğunu önceden sorun.';

export function catSeo(slug: string, name: string): CatSeo {
  return (
    CATEGORY_SEO[slug] || {
      plural: `${name} İşletmeleri`,
      tips: DEFAULT_TIPS,
      faqs: [
        { q: `${name} işletmesi seçerken nelere dikkat etmeliyim?`, a: DEFAULT_TIPS },
        reachFaq(`${trLower(name)} işletmeleri`),
      ],
      related: ['guzellik-merkezi', 'medikal-estetik', 'lazer-epilasyon'],
    }
  );
}

// Konum geneli (kategorisiz) SSS
export const GENERAL_FAQS: Faq[] = [
  { q: '{loc} güzellik merkezi ve kuaför nasıl bulunur?', a: 'Bu sayfada {loc} bölgesinde listelenen işletmeleri kategoriye göre inceleyebilir, adres, konum ve iletişim bilgilerine bakarak size en uygun olanı seçebilirsiniz.' },
  { q: 'İşletmelere nasıl ulaşırım?', a: 'Her işletme sayfasında adres ve harita konumu ile işletmenin eklediği telefon, WhatsApp, web sitesi ve sosyal medya bağlantıları yer alır.' },
  { q: 'Güzellik ve bakım işletmesi seçerken nelere dikkat etmeliyim?', a: 'Hijyen koşullarını, personelin eğitim ve sertifikalarını, kullanılan ürün ve cihazları ve fiyata nelerin dahil olduğunu önceden sorun. Tıbbi uygulamaların (botoks, dolgu, saç ekimi gibi) doktor tarafından yapılması gerekir.' },
  { q: 'İşletmemi GüzellikAdresin\'e nasıl eklerim?', a: 'İşletme Ekle sayfasından ücretsiz kayıt olup işletme bilgilerinizi, hizmetlerinizi ve fotoğraflarınızı ekleyebilirsiniz.' },
];

export const fillFaqs = (faqs: Faq[], loc: string): Faq[] =>
  faqs.map((f) => ({ q: f.q.replace(/\{loc\}/g, loc), a: f.a.replace(/\{loc\}/g, loc) }));

export const faqSchema = (faqs: Faq[]) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const itemListSchema = (items: { name: string; slug: string }[], total?: number) => ({
  '@type': 'ItemList',
  ...(typeof total === 'number' ? { numberOfItems: total } : {}),
  itemListElement: items.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, url: `${SITE}/isletme/${b.slug}` })),
});

export const breadcrumbSchema = (crumbs: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
});

// ------------------------------------------------------------
// İlgili rehber yazıları (konum + kategori eşleşmesine göre)
// ------------------------------------------------------------
const norm = (s: string) =>
  trLower(s)
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Şehre/ilçeye özel rehber yazılarının slug önekleri (başka konumda önerilmesinler)
const LOCAL_POST_PREFIX = /^(adana|ankara|antalya|bakirkoy|beylikduzu|bursa|esenyurt|gaziantep|istanbul|izmir|kadikoy|kayseri|kocaeli|konya|mersin|ordu|samsun|sisli|uskudar|atasehir|kecioren|cankaya)-/;

export function relatedPosts(opts: { il?: string; ilce?: string; catSlug?: string; catName?: string }, n = 3): BlogPost[] {
  const { il, ilce, catSlug, catName } = opts;
  const catKey = catSlug ? catSlug.split('-').slice(0, 2).join('-') : '';
  const scored = getAllPosts()
    .filter((p) => p.audience !== 'isletme')
    .map((p) => {
      let s = 0;
      const slug = p.slug;
      const locHit = (ilce && slug.includes(ilce)) || (il && slug.startsWith(`${il}-`));
      if (ilce && slug.includes(ilce)) s += 4;
      if (il && slug.startsWith(`${il}-`)) s += 2;
      const catHit =
        (catSlug && slug.includes(catKey)) || (catName && norm(p.category) === norm(catName));
      if (catHit) s += 3;
      // Konum verilip konum tutmayan ama başka şehre özel yazıları ele (alakasız şehir)
      if (!locHit && LOCAL_POST_PREFIX.test(slug)) s -= 3;
      return { p, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || (a.p.publishedAt < b.p.publishedAt ? 1 : -1));
  // Aynı slug iki kez kayıtlıysa tekilleştir
  const seen = new Set<string>();
  const uniq = scored.filter((x) => (seen.has(x.p.slug) ? false : (seen.add(x.p.slug), true)));
  const out = uniq.slice(0, n);
  // Konuma özel bir yazı varsa en az birini listede tut
  const isLocal = (p: BlogPost) => (ilce && p.slug.includes(ilce)) || (il && p.slug.startsWith(`${il}-`));
  if ((il || ilce) && !out.some((x) => isLocal(x.p))) {
    const local = uniq.find((x) => isLocal(x.p));
    if (local && out.length) out[out.length - 1] = local;
    else if (local) out.push(local);
  }
  return out.map((x) => x.p);
}
