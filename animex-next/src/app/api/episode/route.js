import { NextResponse } from 'next/server';
import { scrapeEpisode } from '@/lib/scraper';
export async function GET(req) {
  const slug = new URL(req.url).searchParams.get('slug') || '';
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  const data = await scrapeEpisode(slug);
  return NextResponse.json(data);
}
