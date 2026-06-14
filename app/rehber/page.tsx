import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllPosts } from '@/lib/data/blog';

export const metadata = {
  title: 'Rehber — Güzellik ve Bakım İpuçları',
  description: 'Lazer epilasyon, saç ekimi, cilt bakımı, kalıcı makyaj ve daha fazlası hakkında bilmeniz gereken her şey. Uzman bilgileriyle hazırlanmış güzellik ve bakım rehberi.',
};

export const revalidate = 3600;

export default function RehberPage() {
  const posts = getAllPosts();

  return (
    <>
      <Header />
      <div className="ga-list-wrap">
        <div className="ga-list-head">
          <h1>Rehber</h1>
          <p>Güzellik ve bakım hakkında bilmeniz gereken her şey — uzman bilgileriyle</p>
        </div>

        <div className="ga-rehber-grid">
          {posts.map((p) => (
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
      <Footer />
    </>
  );
}
