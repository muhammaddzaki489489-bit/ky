'use client';
import { useState } from 'react';
import Link from 'next/link';

function slugFromUrl(url) {
  if (!url) return null;
  const m = url.match(/\/episode\/(.+?)(?:-sub-indo)?\/?\s*$/);
  return m ? m[1] : null;
}

function animeSlugFromEpSlug(epSlug) {
  const m = epSlug?.match(/^(.+)-episode-\d+$/);
  return m ? m[1] : epSlug;
}

export default function EpisodeClient({ data, epSlug }) {
  const embed = data.embed || {};
  const download = data.download || {};
  const epList = data.episodeList || [];
  const animeSlug = data.slug || animeSlugFromEpSlug(epSlug);

  const allServers = [];
  Object.entries(embed).forEach(([quality, servers]) => {
    Object.entries(servers).forEach(([name, url]) => {
      allServers.push({ quality, name, url });
    });
  });

  const [activeUrl, setActiveUrl] = useState(allServers[0]?.url || data.defaultPlayer || null);

  const prevSlug = data.prev ? slugFromUrl(data.prev) : null;
  const nextSlug = data.next ? slugFromUrl(data.next) : null;

  return (
    <div className="ep-page">
      <Link href={`/anime/${encodeURIComponent(animeSlug)}`} className="back-btn">← Kembali ke Detail</Link>
      <h2>{data.title || `Episode ${data.episode}`}</h2>
      <p className="ep-sub">Episode {data.episode}</p>

      {/* Player */}
      <div className="player-wrap">
        {activeUrl
          ? <iframe src={activeUrl} allowFullScreen scrolling="no" allow="autoplay; fullscreen" />
          : <div className="player-placeholder">Pilih server di bawah</div>
        }
      </div>

      {/* Server buttons */}
      {allServers.length > 0 && (
        <div className="server-section">
          <h3>Streaming</h3>
          {Object.entries(embed).map(([quality, servers]) => (
            <div className="server-group" key={quality}>
              <div className="server-quality">{quality}</div>
              <div className="server-btns">
                {Object.entries(servers).map(([name, url]) => (
                  <button
                    key={name}
                    className={`server-btn${activeUrl === url ? ' active' : ''}`}
                    onClick={() => setActiveUrl(url)}
                  >{name}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download */}
      {Object.keys(download).length > 0 && (
        <div className="dl-section">
          <h3>Download</h3>
          {Object.entries(download).map(([quality, servers]) => (
            <div className="dl-group" key={quality}>
              <div className="dl-quality">{quality}</div>
              <div className="dl-btns">
                {Object.entries(servers).map(([name, url]) => (
                  <a key={name} className="dl-btn" href={url} target="_blank" rel="noopener">{name}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nav prev/next */}
      <div className="nav-eps">
        {prevSlug
          ? <Link href={`/episode/${encodeURIComponent(prevSlug)}`} className="nav-ep-btn">← Ep Sebelumnya</Link>
          : <div />
        }
        <Link href={`/anime/${encodeURIComponent(animeSlug)}`} className="nav-ep-btn">📋 Semua Episode</Link>
        {nextSlug
          ? <Link href={`/episode/${encodeURIComponent(nextSlug)}`} className="nav-ep-btn">Ep Selanjutnya →</Link>
          : <div />
        }
      </div>

      {/* Episode list */}
      {epList.length > 0 && (
        <div className="ep-list-section">
          <h3>Daftar Episode</h3>
          <div className="ep-grid">
            {epList.map((ep, i) => {
              const es = `${animeSlug}-episode-${ep.episode}`;
              return (
                <Link
                  key={i}
                  href={`/episode/${encodeURIComponent(es)}`}
                  className={`ep-btn${ep.episode === data.episode ? ' active' : ''}`}
                >
                  Ep {ep.episode}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
