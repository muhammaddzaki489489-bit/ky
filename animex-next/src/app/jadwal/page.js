import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { scrapeJadwal } from '@/lib/scraper';

function slugFromLink(link) {
  return link?.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '') || '';
}

export default async function JadwalPage() {
  const data = await scrapeJadwal();
  const schedule = data.schedule || {};
  const days = Object.keys(schedule);
  return (
    <>
      <Navbar />
      <main className="main-content">
        <section className="section">
          <h2 className="section-title">Jadwal Rilis</h2>
          {days.length ? (
            <div className="jadwal-grid">
              {days.map(day => (
                <div className="jadwal-day" key={day}>
                  <div className="jadwal-day-title">{day}</div>
                  <ul>
                    {schedule[day].map((item, i) => (
                      <li key={i}>
                        <Link href={`/anime/${encodeURIComponent(slugFromLink(item.link))}`}>{item.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-box"><div className="icon">📭</div><p>Jadwal tidak tersedia.</p></div>
          )}
        </section>
      </main>
      <footer className="footer"><p>AnimeX © 2026 — Scraper by <span className="accent">rynaqrtz</span></p></footer>
    </>
  );
}
