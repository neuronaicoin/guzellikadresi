/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    // WebP/AVIF otomatik dönüşüm + responsive boyutlar (hız için)
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Supabase Storage'dan gelecek işletme fotoğrafları
      { protocol: 'https', hostname: '*.supabase.co' },
      // Unsplash (geçici/demo görseller)
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 200, 256, 384],
  },
};

module.exports = nextConfig;
