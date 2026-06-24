'use client';
import { useRouter } from 'next/navigation';

export default function Pagination({ pagination, basePath }) {
  const router = useRouter();
  if (!pagination) return null;
  const { current = 1, total, hasNext } = pagination;
  if (!total && !hasNext) return null;

  const pages = [];
  if (total) {
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    if (start > 1) pages.push({ label: '1', page: 1 });
    if (start > 2) pages.push({ label: '...', page: null });
    for (let i = start; i <= end; i++) pages.push({ label: String(i), page: i });
    if (end < total - 1) pages.push({ label: '...', page: null });
    if (end < total) pages.push({ label: String(total), page: total });
  }

  function go(page) {
    router.push(`${basePath}?page=${page}`);
  }

  return (
    <div className="pagination-wrap">
      {current > 1 && <button className="page-btn" onClick={() => go(current - 1)}>‹ Prev</button>}
      {pages.map((p, i) =>
        p.page
          ? <button key={i} className={`page-btn${p.page === current ? ' active' : ''}`} onClick={() => go(p.page)}>{p.label}</button>
          : <span key={i} style={{ color: 'var(--text2)', padding: '0 4px' }}>...</span>
      )}
      {hasNext && <button className="page-btn" onClick={() => go(current + 1)}>Next ›</button>}
    </div>
  );
}
