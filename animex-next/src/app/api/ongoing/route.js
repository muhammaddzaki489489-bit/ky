import { NextResponse } from 'next/server';
import { scrapeOngoing } from '@/lib/scraper';
export async function GET(req) {
  const page = parseInt(new URL(req.url).searchParams.get('page')) || 1;
  const data = await scrapeOngoing(page);
  return NextResponse.json(data);
}
