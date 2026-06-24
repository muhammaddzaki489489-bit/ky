import Navbar from '@/components/Navbar';
import AnimeGrid from '@/components/AnimeGrid';
import Pagination from '@/components/Pagination';
import { scrapeHome } from '@/lib/scraper';

export default async function HomePage({ searchParams }) {
  const page = parseInt(searchParams?.page) || 1;
  const data = await scrapeHome(page);

  return (
    <>
      <Navbar />
      <main className="main-content">
        <section className="hero">
          <div className="hero-text">
            <p className="hero-eyebrow">Sub Indonesia • Update Harian</p>
            <h1>Nonton Anime<br /><span className="accent">Gratis & Lengkap</span></h1>
            <p className="hero-sub">Streaming anime sub indo tanpa iklan, update setiap hari.</p>
          </div>
        </section>
        <section className="section">
          <h2 className="section-title">Anime Terbaru</h2>
          <AnimeGrid items={data.items} />
          <Pagination pagination={data.pagination} basePath="/" />
        </section>
      </main>
      <footer className="footer">
        <p>AnimeX © 2026 — Scraper by <span className="accent">rynaqrtz</span></p>
      </footer>
    </>
  );
}
