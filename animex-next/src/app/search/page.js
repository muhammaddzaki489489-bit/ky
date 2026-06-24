import Navbar from '@/components/Navbar';
import AnimeGrid from '@/components/AnimeGrid';
import Pagination from '@/components/Pagination';
import { scrapeSearch } from '@/lib/scraper';

export default async function SearchPage({ searchParams }) {
  const q = searchParams?.q || '';
  const page = parseInt(searchParams?.page) || 1;
  const data = q ? await scrapeSearch(q, page) : { items: [], pagination: null };
  return (
    <>
      <Navbar />
      <main className="main-content">
        <section className="section">
          <h2 className="section-title">
            Hasil: <span className="accent">{q}</span>
          </h2>
          {!q
            ? <div className="empty-box"><div className="icon">🔍</div><p>Masukkan kata kunci pencarian.</p></div>
            : <AnimeGrid items={data.items} />
          }
          {data.pagination && <Pagination pagination={data.pagination} basePath={`/search?q=${encodeURIComponent(q)}&`} />}
        </section>
      </main>
      <footer className="footer"><p>AnimeX © 2026 — Scraper by <span className="accent">rynaqrtz</span></p></footer>
    </>
  );
}
