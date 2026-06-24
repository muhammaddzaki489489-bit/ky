'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const GENRES = [
  'action','adventure','comedy','demons','drama','ecchi','fantasy',
  'game','harem','historical','horror','josei','magic','martial-arts',
  'mecha','military','music','mystery','parody','police','psychological',
  'romance','samurai','school','sci-fi','seinen','shoujo','shoujo-ai',
  'shounen','slice-of-life','space','sports','super-power','supernatural',
  'thriller','vampire','yaoi','yuri'
];

export default function GenreTabs({ currentSlug }) {
  const router = useRouter();
  return (
    <div className="genre-tags">
      {GENRES.map(g => (
        <button
          key={g}
          className={`genre-tag${g === currentSlug ? ' active' : ''}`}
          onClick={() => router.push(`/genre/${g}`)}
        >
          {g.replace(/-/g, ' ')}
        </button>
      ))}
    </div>
  );
}
