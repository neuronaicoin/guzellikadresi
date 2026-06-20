import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Asıl (kanonik) domain
const CANONICAL_HOST = 'guzellikadresin.com';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Sadece Railway'in geçici adresinden gelenleri yönlendir.
  // (localhost ve asıl domain etkilenmez.)
  const isRailwayHost = host.endsWith('.up.railway.app');

  if (isRailwayHost) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = 'https:';
    url.port = '';
    // 301 kalıcı yönlendirme (SEO için doğru sinyal)
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

// Tüm sayfalara uygula, statik dosyaları/asset'leri hariç tut
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|og-image.png|robots.txt|sitemap.xml).*)',
  ],
};
