import Navbar from '@/components/Navbar';
import AnimeGrid from '@/components/AnimeGrid';
import Pagination from '@/components/Pagination';
import { scrapeTerbaru } from '@/lib/scraper';

export default async function TerbaruPage({ searchParams }) {
  const page = parseInt(searchParams?.page) || 1;
  const data = await scrapeTerbaru(page);
  return (
    <>
      <Navbar />
      <main className="main-content">
        <section className="section">
          <h2 className="section-title">Anime Terbaru</h2>
          <AnimeGrid items={data.items} />
          <Pagination pagination={data.pagination} basePath="/terbaru" />
        </section>
      </main>
      <footer className="footer"><p>AnimeX © 2026 — Scraper by <span className="accent">rynaqrtz</span></p></footer>
    </>
  );
}
