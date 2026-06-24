import { NextResponse } from 'next/server';
import { scrapeDetail } from '@/lib/scraper';
export async function GET(req, { params }) {
  const data = await scrapeDetail(params.slug);
  return NextResponse.json(data);
}
