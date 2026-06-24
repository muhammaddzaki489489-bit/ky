import { NextResponse } from 'next/server';
import { scrapeComplete } from '@/lib/scraper';
export async function GET(req) {
  const page = parseInt(new URL(req.url).searchParams.get('page')) || 1;
  const data = await scrapeComplete(page);
  return NextResponse.json(data);
}
