import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingView from '@/components/ListingView';
import { getCategoryBySlug, getBusinessList } from '@/lib/queries-list';

export const revalidate = 600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) return { title: 'Kategori bulunamadı' };
  return {
    title: `${cat.name} — Türkiye Geneli`,
    description: `Türkiye genelinde ${cat.name.toLowerCase()} işletmelerini keşfedin. Bölgenizdeki en iyi uzmanları bulun, karşılaştırın, ulaşın.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sayfa?: string };
}) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) notFound();

  const page = Number(searchParams.sayfa) || 1;
  const { items, total, perPage } = await getBusinessList({ categoryId: cat.id, page });

  return (
    <>
      <Header />
      <ListingView
        title={`${cat.emoji || ''} ${cat.name}`}
        subtitle="Türkiye geneli"
        items={items}
        total={total}
        perPage={perPage}
        page={page}
        basePath={`/kategori/${cat.slug}`}
      />
      <Footer />
    </>
  );
}
