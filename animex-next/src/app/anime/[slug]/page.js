import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { scrapeDetail } from '@/lib/scraper';

export default async function AnimeDetailPage({ params }) {
  const slug = decodeURIComponent(params.slug);
  const data = await scrapeDetail(slug);
  const info = data.info || {};
  const episodes = data.episodes || [];

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Link href="/" className="back-btn">← Kembali</Link>

        {data.error && !data.title ? (
          <div className="error-box"><div className="icon">⚠️</div><p>Gagal memuat detail anime.</p></div>
        ) : (
          <>
            <div className="detail-hero">
              <div className="detail-cover">
                <img
                  src={data.cover || `https://i2.wp.com/nontonanimex.com/assets/images/${slug}.jpg`}
                  alt={data.title}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="detail-info">
                <h1>{data.title || slug}</h1>
                <div className="detail-meta">
                  {data.score && <div className="meta-chip rating">⭐ <b>{data.score}</b></div>}
                  {info['Status'] && <div className="meta-chip">📺 <b>{info['Status']}</b></div>}
                  {info['Type'] && <div className="meta-chip">🎬 <b>{info['Type']}</b></div>}
                  {info['Studio'] && <div className="meta-chip">🏢 <b>{info['Studio']}</b></div>}
                  {info['Durasi'] && <div className="meta-chip">⏱ <b>{info['Durasi']}</b></div>}
                </div>
                {info['Genre'] && (
                  <div className="genre-pills">
                    {info['Genre'].split(',').map((g, i) => {
                      const gs = g.trim().toLowerCase().replace(/\s+/g, '-');
                      return <Link key={i} href={`/genre/${gs}`} className="genre-pill">{g.trim()}</Link>;
                    })}
                  </div>
                )}
                <div className="sinopsis">
                  <h3>Sinopsis</h3>
                  <p>{info['Sinopsis'] || info['Synopsis'] || 'Tidak ada sinopsis.'}</p>
                </div>
              </div>
            </div>

            <div className="ep-section">
              <h2>Daftar Episode ({episodes.length})</h2>
              {episodes.length ? (
                <div className="ep-grid">
                  {episodes.map((ep, i) => (
                    <Link
                      key={i}
                      href={`/episode/${encodeURIComponent(`${slug}-episode-${ep.episode}`)}`}
                      className="ep-btn"
                    >
                      Ep {ep.episode}
                      {ep.releaseDate && <div className="ep-date">{ep.releaseDate}</div>}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-box"><div className="icon">📭</div><p>Belum ada episode.</p></div>
              )}
            </div>
          </>
        )}
      </main>
      <footer className="footer"><p>AnimeX © 2026 — Scraper by <span className="accent">rynaqrtz</span></p></footer>
    </>
  );
}
