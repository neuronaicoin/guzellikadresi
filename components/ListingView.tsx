import BusinessCard from '@/components/BusinessCard';
import type { BusinessCard as BizCard } from '@/lib/types';

export default function ListingView({
  title,
  subtitle,
  items,
  total,
  perPage,
  page,
  basePath,
}: {
  title: string;
  subtitle: string;
  items: BizCard[];
  total: number;
  perPage: number;
  page: number;
  basePath: string; // pagination linkleri için (örn. /istanbul/kadikoy)
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="ga-list-wrap">
      <div className="ga-list-head">
        <h1>{title}</h1>
        <p>{subtitle} · <b>{total}</b> işletme</p>
      </div>

      {items.length === 0 ? (
        <div className="ga-list-empty">
          <div style={{ fontSize: 34, marginBottom: 10 }}>🔍</div>
          <h3>Bu bölgede henüz işletme yok</h3>
          <p>İlk ekleyen siz olun, bölgenizdeki müşterilerle hemen buluşun.</p>
          <a href="/isletme-ekle" className="ga-list-cta">İşletme Ekle →</a>
        </div>
      ) : (
        <>
          <div className="ga-grid">
            {items.map((b) => <BusinessCard key={b.id} b={b} />)}
          </div>

          {totalPages > 1 && (
            <nav className="ga-pagination">
              {page > 1 && <a href={`${basePath}?sayfa=${page - 1}`} className="ga-page-btn">← Önceki</a>}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <span key={p} style={{ display: 'contents' }}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="ga-page-dots">…</span>}
                    <a href={`${basePath}?sayfa=${p}`} className={`ga-page-btn ${p === page ? 'active' : ''}`}>{p}</a>
                  </span>
                ))}
              {page < totalPages && <a href={`${basePath}?sayfa=${page + 1}`} className="ga-page-btn">Sonraki →</a>}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
