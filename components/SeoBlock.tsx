// Liste sayfalarının altındaki SEO içerik bloğu (giriş metni, ipuçları,
// SSS ve iç linkler). Mevcut "ga-seo-block" görünümünü birebir kullanır.
type LinkItem = { href: string; label: string };

const wrap = { maxWidth: 900, margin: '0 auto', padding: '24px 20px 48px', lineHeight: 1.7, color: '#333', overflowWrap: 'anywhere' as const };
const h2 = { fontSize: 22, marginBottom: 12, color: '#0e2148' };
const h3 = { fontSize: 18, margin: '20px 0 10px', color: '#0e2148' };
const link = { color: '#c9a24b' };

export default function SeoBlock({
  heading,
  paragraphs,
  faqTitle,
  faqs,
  linkGroups,
}: {
  heading: string;
  paragraphs: string[];
  faqTitle?: string;
  faqs?: { q: string; a: string }[];
  linkGroups?: { title: string; links: LinkItem[] }[];
}) {
  return (
    <section className="ga-seo-block" style={wrap}>
      <h2 style={h2}>{heading}</h2>
      {paragraphs.filter(Boolean).map((p, i) => (
        <p key={i} style={{ marginBottom: 10 }}>{p}</p>
      ))}

      {faqs && faqs.length > 0 && (
        <>
          <h3 style={h3}>{faqTitle || 'Sıkça Sorulan Sorular'}</h3>
          {faqs.map((f, i) => (
            <div key={i} className="ga-faq-item">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </>
      )}

      {(linkGroups || [])
        .filter((g) => g.links.length > 0)
        .map((g, i) => (
          <div key={i}>
            <h3 style={h3}>{g.title}</h3>
            <ul style={{ paddingLeft: 20 }}>
              {g.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} style={link}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </section>
  );
}
