// Panel sayfaları (giriş gerektirir) arama motorlarında görünmesin
export const metadata = {
  title: 'İşletme Paneli',
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
