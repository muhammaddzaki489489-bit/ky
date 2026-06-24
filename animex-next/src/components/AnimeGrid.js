'use client';
import Link from 'next/link';

function slugFromLink(link) {
  if (!link) return '';
  return link.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '');
}

export default function AnimeGrid({ items }) {
  if (!items?.length) return (
    <div className="empty-box">
      <div className="icon">📭</div>
      <p>Tidak ada data.</p>
    </div>
  );

  return (
    <div className="anime-grid">
      {items.map((item, i) => {
        const slug = slugFromLink(item.link);
        return (
          <Link href={`/anime/${encodeURIComponent(slug)}`} key={i} className="anime-card">
            {item.img
              ? <img className="card-thumb" src={item.img} alt={item.title} loading="lazy"
                  onError={e => { e.target.outerHTML = '<div class="card-thumb-err">No Image</div>'; }} />
              : <div className="card-thumb-err">No Image</div>
            }
            <div className="card-info">
              <div className="card-title">{item.title}</div>
              {item.eps && <div className="card-meta">{item.eps}</div>}
              {item.score && <div className="card-score">★ {item.score}</div>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
