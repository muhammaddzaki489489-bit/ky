import { NextResponse } from 'next/server';
import { scrapeSearch } from '@/lib/scraper';
export async function GET(req) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page')) || 1;
  if (!q) return NextResponse.json({ items: [], pagination: { hasNext: false } });
  const data = await scrapeSearch(q, page);
  return NextResponse.json(data);
}
