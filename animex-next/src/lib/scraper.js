import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const BASE_URL = 'https://nontonanimex.com';
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.104 Mobile Safari/537.36',
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
];

let uaIndex = 0;

function getHeaders(ref) {
  const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex++;
  const isMobile = ua.includes('Mobile') || ua.includes('Android');
  return {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': ref || BASE_URL + '/',
    'Cache-Control': 'no-cache',
    'DNT': '1',
    'Sec-Ch-Ua-Mobile': isMobile ? '?1' : '?0',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive'
  };
}

function randomDelay(min = 200, max = 600) {
  return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));
}

async function get(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      await randomDelay();
      const res = await axios({
        url, method: 'GET',
        headers: getHeaders(url),
        timeout: 25000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true }),
        maxRedirects: 0,
        decompress: true,
        validateStatus: s => s >= 200 && s < 400
      });
      return res;
    } catch (e) {
      if (e.response?.status >= 300 && e.response?.status < 400) return e.response;
      if (i < retries - 1) await randomDelay(800, 2000);
      else throw e;
    }
  }
}

function decodeToken(tok) {
  try {
    const r = tok.split('').reverse().join('');
    let d = '';
    for (let i = 0; i < r.length; i += 2) {
      const c = parseInt(r.substr(i, 2), 36) - ((i / 2) % 7 + 5);
      d += String.fromCharCode(c);
    }
    return decodeURIComponent(d);
  } catch { return null; }
}

function toEmbed(u) {
  if (!u) return null;
  if (u.includes('mega.nz/file/')) return u.replace('mega.nz/file/', 'mega.nz/embed/');
  if (u.includes('mega.nz/#!')) return u.replace('mega.nz/#!', 'mega.nz/embed/#!');
  const a = u.match(/acefile\.co\/f\/(\d+)/);
  if (a) return 'https://acefile.co/player/' + a[1];
  const k = u.match(/krakenfiles\.com\/view\/([^/]+)/);
  if (k) return 'https://krakenfiles.com/embed-video/' + k[1];
  return u;
}

function isEmbed(n) {
  const x = n.toLowerCase();
  return x === 'acefile' || x === 'mega' || x === 'kfiles';
}

async function resolveRedirect(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 10,
      validateStatus: s => s >= 200 && s < 400,
      headers: { 'User-Agent': USER_AGENTS[0], 'Referer': BASE_URL + '/' },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 12000
    });
    return res.request?.res?.responseUrl || res.config?.url;
  } catch { return null; }
}

function parseList(html) {
  const $ = cheerio.load(html);
  const items = [];
  $('div.xrelated').each((i, el) => {
    const link = $(el).find('a.rt').attr('href') || $(el).find('a').attr('href');
    const img  = $(el).find('img').attr('src');
    const title = $(el).find('div.titlelist').text().trim();
    const eps  = $(el).find('div.eplist').text().trim();
    const score = $(el).find('div.starlist').text().replace('★', '').trim();
    if (title && link) items.push({
      title, link: link.startsWith('http') ? link : BASE_URL + link,
      img: img || null, eps: eps || null, score: score || null
    });
  });
  return items;
}

function parsePagination($, lastUrl) {
  const p = { current: 1, next: null, total: null, hasNext: false };
  const links = [];
  $('.pagination a, .pagination span').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href) links.push({ text, href });
  });
  const nums = links.filter(l => /^\d+$/.test(l.text)).map(l => parseInt(l.text));
  if (nums.length) p.total = Math.max(...nums);
  const cur = $('.pagination span.bg-gdark');
  if (cur.length) {
    const t = cur.text().trim();
    if (/^\d+$/.test(t)) p.current = parseInt(t);
  } else {
    const m = lastUrl?.match(/\/page\/(\d+)/);
    if (m) p.current = parseInt(m[1]);
  }
  if (p.total && p.current < p.total) {
    p.hasNext = true;
    const nxt = links.find(l => ['»','>'].includes(l.text) || l.text.toLowerCase().includes('next'));
    if (nxt?.href) p.next = nxt.href.startsWith('http') ? nxt.href : BASE_URL + nxt.href;
    else {
      const base = lastUrl?.replace(/\/page\/\d+$/, '').replace(/\/$/, '');
      p.next = base + '/page/' + (p.current + 1);
    }
  }
  return p;
}

export async function scrapeHome(page = 1) {
  try {
    const url = page === 1 ? BASE_URL + '/' : BASE_URL + `/page/${page}/`;
    const html = (await get(url)).data;
    const items = parseList(html);
    const $ = cheerio.load(html);
    return { items, pagination: parsePagination($, url) };
  } catch (e) {
    return { items: [], pagination: { current: page, hasNext: false }, error: e.message };
  }
}

export async function scrapeTerbaru(page = 1) {
  try {
    const url = page === 1 ? BASE_URL + '/terbaru' : BASE_URL + `/terbaru/page/${page}`;
    const html = (await get(url)).data;
    const items = parseList(html);
    const $ = cheerio.load(html);
    return { items, pagination: parsePagination($, url) };
  } catch (e) {
    return { items: [], pagination: { current: page, hasNext: false }, error: e.message };
  }
}

export async function scrapeJadwal() {
  try {
    const url = BASE_URL + '/jadwal-rilis';
    const html = (await get(url)).data;
    const $ = cheerio.load(html);
    const schedule = {};
    $('.jdlist div').each((i, el) => {
      const day = $(el).find('h2').text().trim();
      const items = [];
      $(el).find('ul li a').each((j, a) => {
        const title = $(a).text().trim();
        const link = $(a).attr('href');
        if (title && link) items.push({ title, link: link.startsWith('http') ? link : BASE_URL + link });
      });
      if (day && items.length) schedule[day] = items;
    });
    return { schedule };
  } catch (e) {
    return { schedule: {}, error: e.message };
  }
}

export async function scrapeOngoing(page = 1) {
  try {
    const url = page === 1 ? BASE_URL + '/ongoing' : BASE_URL + `/ongoing/page/${page}`;
    const html = (await get(url)).data;
    const items = parseList(html);
    const $ = cheerio.load(html);
    return { items, pagination: parsePagination($, url) };
  } catch (e) {
    return { items: [], pagination: { current: page, hasNext: false }, error: e.message };
  }
}

export async function scrapeComplete(page = 1) {
  try {
    const url = page === 1 ? BASE_URL + '/complete' : BASE_URL + `/complete/page/${page}`;
    const html = (await get(url)).data;
    const items = parseList(html);
    const $ = cheerio.load(html);
    return { items, pagination: parsePagination($, url) };
  } catch (e) {
    return { items: [], pagination: { current: page, hasNext: false }, error: e.message };
  }
}

export async function scrapeGenre(slug, page = 1) {
  try {
    const url = page === 1 ? BASE_URL + `/genre/${slug}/` : BASE_URL + `/genre/${slug}/page/${page}`;
    const html = (await get(url)).data;
    const items = parseList(html);
    const $ = cheerio.load(html);
    return { items, pagination: parsePagination($, url) };
  } catch (e) {
    return { items: [], pagination: { current: page, hasNext: false }, error: e.message };
  }
}

export async function scrapeSearch(query, page = 1) {
  try {
    const url = page === 1
      ? BASE_URL + `/search/?q=${encodeURIComponent(query)}`
      : BASE_URL + `/search/page/${page}/?q=${encodeURIComponent(query)}`;
    const html = (await get(url)).data;
    const items = parseList(html);
    const $ = cheerio.load(html);
    return { items, pagination: parsePagination($, url) };
  } catch (e) {
    return { items: [], pagination: { current: page, hasNext: false }, error: e.message };
  }
}

export async function scrapeDetail(slug) {
  try {
    const url = BASE_URL + `/${slug}/`;
    const html = (await get(url)).data;
    const $ = cheerio.load(html);
    const title = $('div.htitle h1').text().trim() || $('h1').first().text().trim();
    const score = $('div.htitle span').text().trim() || null;
    const info = {};
    $('ul.infol li').each((i, el) => {
      const txt = $(el).text().trim();
      const parts = txt.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join(':').trim();
        if (key && val) info[key] = val;
      }
    });
    const cover = $('div.aniinfo img').attr('src') || $('img.animecover').attr('src') || null;
    const episodes = [];
    $('#ctlist li').each((i, el) => {
      const link = $(el).find('a').attr('href');
      const epTitle = $(el).find('a').text().trim();
      const date = $(el).find('span').last().text().trim();
      if (link) {
        const num = parseInt(link.match(/episode-(\d+)-/)?.[1]);
        episodes.push({
          episode: num, title: epTitle,
          url: link.startsWith('http') ? link : BASE_URL + link,
          releaseDate: date || null
        });
      }
    });
    return { title, score, info, cover, episodes, slug };
  } catch (e) {
    return { title: '', score: null, info: {}, cover: null, episodes: [], error: e.message };
  }
}

export async function scrapeEpisode(input) {
  try {
    let slug, num;
    if (input.includes('http')) {
      const match = input.match(/\/episode\/([^-]+(?:-[^-]+)*)-episode-(\d+)-/);
      if (!match) throw new Error('Invalid URL');
      slug = match[1]; num = parseInt(match[2]);
    } else {
      const parts = input.split('-episode-');
      if (parts.length === 2) { slug = parts[0]; num = parseInt(parts[1]); }
      else {
        const m = input.match(/^(.+?)-(\d+)$/);
        if (!m) throw new Error('Invalid format');
        slug = m[1]; num = parseInt(m[2]);
      }
    }

    const url = BASE_URL + `/episode/${slug}-episode-${num}-sub-indo/`;
    const html = (await get(url)).data;
    const $ = cheerio.load(html);

    const title = $('.tlpost').text().trim() || $('h1').first().text().trim();
    const poster = $('.imgrpv').attr('src') || null;
    const defaultPlayer = $('#mediaplayer').attr('src') || null;

    const embedMap = {}, downloadMap = {}, promises = [];

    $('.dlist ul li').each((i, el) => {
      const quality = $(el).find('strong').text().trim();
      if (!quality) return;
      const emb = {}, dls = {};
      $(el).find('a').each((j, a) => {
        const name = $(a).text().trim();
        const href = $(a).attr('href') || '';
        const token = href.split('/go/')[1];
        if (token) {
          const decoded = decodeToken(token);
          if (decoded) {
            if (isEmbed(name)) emb[name] = decoded;
            else dls[name] = decoded;
          }
        }
      });
      if (Object.keys(emb).length) {
        const rp = Object.entries(emb).map(async ([k, v]) => {
          if (v.includes('link.desustream.com')) {
            const resolved = await resolveRedirect(v);
            return [k, toEmbed(resolved) || resolved || v];
          }
          return [k, toEmbed(v) || v];
        });
        promises.push(Promise.all(rp).then(results => {
          const re = Object.fromEntries(results);
          if (Object.keys(re).length) embedMap[quality] = re;
        }));
      }
      if (Object.keys(dls).length) {
        const rp = Object.entries(dls).map(async ([k, v]) => {
          if (v.includes('link.desustream.com')) {
            const resolved = await resolveRedirect(v);
            return [k, resolved || v];
          }
          return [k, v];
        });
        promises.push(Promise.all(rp).then(results => {
          const rd = Object.fromEntries(results);
          if (Object.keys(rd).length) downloadMap[quality] = rd;
        }));
      }
    });

    await Promise.all(promises);

    const pLink = $('#prev a').attr('href');
    const nLink = $('#next a').attr('href');
    const prev = pLink ? (pLink.startsWith('http') ? pLink : BASE_URL + pLink) : (num > 1 ? BASE_URL + `/episode/${slug}-episode-${num-1}-sub-indo/` : null);
    const next = nLink ? (nLink.startsWith('http') ? nLink : BASE_URL + nLink) : null;

    // get episode list
    let episodeList = [];
    try {
      const dHtml = (await get(BASE_URL + `/${slug}/`)).data;
      const $d = cheerio.load(dHtml);
      $d('#ctlist li').each((i, el) => {
        const link = $d(el).find('a').attr('href');
        const t = $d(el).find('a').text().trim();
        if (link) {
          const n = parseInt(link.match(/episode-(\d+)-/)?.[1]);
          if (n) episodeList.push({ episode: n, title: t || `Episode ${n}`, url: link.startsWith('http') ? link : BASE_URL + link });
        }
      });
      episodeList.sort((a, b) => a.episode - b.episode);
    } catch {}

    return { slug, episode: num, title, poster, defaultPlayer, embed: embedMap, download: downloadMap, prev, next, episodeList };
  } catch (e) {
    return { error: e.message };
  }
}
