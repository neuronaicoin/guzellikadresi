import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GüzellikAdresin',
    short_name: 'GüzellikAdresin',
    description: 'Bölgendeki güzellik ve bakım merkezlerini bul.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e2148',
    theme_color: '#0e2148',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
