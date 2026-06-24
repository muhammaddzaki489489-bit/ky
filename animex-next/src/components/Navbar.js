'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  function doSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link className="logo" href="/">
          <span className="logo-icon">AX</span>
          <span className="logo-text">AnimeX</span>
        </Link>
        <form className="nav-search" onSubmit={doSearch}>
          <input
            type="text" placeholder="Cari anime..."
            value={query} onChange={e => setQuery(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/terbaru">Terbaru</Link></li>
          <li><Link href="/jadwal">Jadwal</Link></li>
          <li><Link href="/ongoing">Ongoing</Link></li>
          <li><Link href="/complete">Complete</Link></li>
          <li><Link href="/genre/action">Genre</Link></li>
        </ul>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>
      {menuOpen && (
        <div className="nav-mobile open">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/terbaru" onClick={() => setMenuOpen(false)}>Terbaru</Link>
          <Link href="/jadwal" onClick={() => setMenuOpen(false)}>Jadwal</Link>
          <Link href="/ongoing" onClick={() => setMenuOpen(false)}>Ongoing</Link>
          <Link href="/complete" onClick={() => setMenuOpen(false)}>Complete</Link>
          <Link href="/genre/action" onClick={() => setMenuOpen(false)}>Genre</Link>
        </div>
      )}
    </nav>
  );
}
