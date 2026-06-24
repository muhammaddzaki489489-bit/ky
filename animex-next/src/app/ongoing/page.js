import Navbar from '@/components/Navbar';
import AnimeGrid from '@/components/AnimeGrid';
import Pagination from '@/components/Pagination';
import { scrapeOngoing } from '@/lib/scraper';

export default async function OngoingPage({ searchParams }) {
  const page = parseInt(searchParams?.page) || 1;
  const data = await scrapeOngoing(page);
  return (
    <>
      <Navbar />
      <main className="main-content">
        <section className="section">
          <h2 className="section-title">Sedang Tayang <span className="badge-ongoing">Ongoing</span></h2>
          <AnimeGrid items={data.items} />
          <Pagination pagination={data.pagination} basePath="/ongoing" />
        </section>
      </main>
      <footer className="footer"><p>AnimeX © 2026 — Scraper by <span className="accent">rynaqrtz</span></p></footer>
    </>
  );
}
