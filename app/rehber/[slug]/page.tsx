import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { getPostBySlug, getRecentPosts } from '@/lib/data/blog';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Yazı bulunamadı' };
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.heroImage],
      type: 'article',
    },
  };
}

export default function RehberPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRecentPosts(4).filter((p) => p.slug !== post.slug).slice(0, 3);

  // BlogPosting + FAQPage schema
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    image: post.heroImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: 'Editör Ekibi' },
  };
  const faqSchema = post.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <article className="ga-post-wrap">
        <BackButton label="Tüm Rehber" />
        <span className="ga-post-cat">{post.category}</span>
        <h1 className="ga-post-title">{post.title}</h1>
        <div className="ga-post-meta">{post.readMinutes} dk okuma</div>

        <div className="ga-post-hero" style={{ backgroundImage: `url(${post.heroImage})` }} />

        <div className="ga-post-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

        {post.faq.length > 0 && (
          <section className="ga-post-faq">
            <h2>Sıkça Sorulan Sorular</h2>
            {post.faq.map((f, i) => (
              <div key={i} className="ga-faq-item">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>
        )}

        <div className="ga-post-cta">
          <h3>Bölgenizdeki uzmanları keşfedin</h3>
          <p>Aradığınız hizmeti veren işletmeleri bulun, karşılaştırın ve doğrudan iletişime geçin.</p>
          <a href="/ara" className="ga-list-cta">Hemen Ara →</a>
        </div>
      </article>

      {related.length > 0 && (
        <div className="ga-list-wrap" style={{ paddingTop: 0 }}>
          <h2 className="ga-related-title">İlgili Rehber Yazıları</h2>
          <div className="ga-rehber-grid">
            {related.map((p) => (
              <a key={p.slug} href={`/rehber/${p.slug}`} className="ga-rehber-card">
                <div className="ga-rehber-img" style={{ backgroundImage: `url(${p.heroImage})` }}>
                  <span className="ga-rehber-cat">{p.category}</span>
                </div>
                <div className="ga-rehber-body">
                  <h2>{p.title}</h2>
                  <p>{p.excerpt}</p>
                  <span className="ga-rehber-meta">{p.readMinutes} dk okuma</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
