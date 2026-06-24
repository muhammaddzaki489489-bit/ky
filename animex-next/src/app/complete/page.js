import Navbar from '@/components/Navbar';
import AnimeGrid from '@/components/AnimeGrid';
import Pagination from '@/components/Pagination';
import { scrapeComplete } from '@/lib/scraper';

export default async function CompletePage({ searchParams }) {
  const page = parseInt(searchParams?.page) || 1;
  const data = await scrapeComplete(page);
  return (
    <>
      <Navbar />
      <main className="main-content">
        <section className="section">
          <h2 className="section-title">Selesai Tayang <span className="badge-completed">Complete</span></h2>
          <AnimeGrid items={data.items} />
          <Pagination pagination={data.pagination} basePath="/complete" />
        </section>
      </main>
      <footer className="footer"><p>AnimeX © 2026 — Scraper by <span className="accent">rynaqrtz</span></p></footer>
    </>
  );
}
