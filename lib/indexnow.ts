// IndexNow — yeni/güncellenen URL'leri Google, Bing, Yandex'e anında bildirir.
// Arama motorlarının sayfayı haftalar yerine saatler içinde taramasını sağlar.

const INDEXNOW_KEY = '003f09e2b5dd4b79b41eba334da41075';
const HOST = 'guzellikadresin.com';
const SITE = 'https://guzellikadresin.com';

// Tek veya çok URL'yi IndexNow'a gönder. Hata sessizce yutulur (kritik değil).
export async function notifyIndexNow(urls: string | string[]) {
  const list = (Array.isArray(urls) ? urls : [urls])
    .map((u) => (u.startsWith('http') ? u : `${SITE}${u.startsWith('/') ? '' : '/'}${u}`))
    .slice(0, 10000);

  if (list.length === 0) return;

  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: list,
      }),
    });
  } catch {
    // sessiz
  }
}
