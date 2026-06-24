import Navbar from '@/components/Navbar';
import EpisodeClient from '@/components/EpisodeClient';
import { scrapeEpisode } from '@/lib/scraper';

export default async function EpisodePage({ params }) {
  const epSlug = decodeURIComponent(params.slug);
  const data = await scrapeEpisode(epSlug);

  return (
    <>
      <Navbar />
      <main className="main-content">
        {data.error ? (
          <div className="error-box"><div className="icon">⚠️</div><p>Gagal memuat episode.</p></div>
        ) : (
          <EpisodeClient data={data} epSlug={epSlug} />
        )}
      </main>
      <footer className="footer"><p>AnimeX © 2026 — Scraper by <span className="accent">rynaqrtz</span></p></footer>
    </>
  );
}
