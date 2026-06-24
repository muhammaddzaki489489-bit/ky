import Navbar from '@/components/Navbar';
import AnimeGrid from '@/components/AnimeGrid';
import Pagination from '@/components/Pagination';
import GenreTabs from '@/components/GenreTabs';
import { scrapeGenre } from '@/lib/scraper';

export default async function GenrePage({ params, searchParams }) {
  const slug = params.slug;
  const page = parseInt(searchParams?.page) || 1;
  const data = await scrapeGenre(slug, page);
  return (
    <>
      <Navbar />
      <main className="main-content">
        <section className="section">
          <h2 className="section-title">Genre: <span className="accent" style={{textTransform:'capitalize'}}>{slug.replace(/-/g,' ')}</span></h2>
          <GenreTabs currentSlug={slug} />
          <AnimeGrid items={data.items} />
          <Pagination pagination={data.pagination} basePath={`/genre/${slug}`} />
        </section>
      </main>
      <footer className="footer"><p>AnimeX © 2026 — Scraper by <span className="accent">rynaqrtz</span></p></footer>
    </>
  );
}
