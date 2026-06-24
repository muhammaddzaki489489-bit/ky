import { NextResponse } from 'next/server';
import { scrapeGenre } from '@/lib/scraper';
export async function GET(req, { params }) {
  const page = parseInt(new URL(req.url).searchParams.get('page')) || 1;
  const data = await scrapeGenre(params.slug, page);
  return NextResponse.json(data);
}
