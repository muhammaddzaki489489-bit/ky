import { NextResponse } from 'next/server';
import { scrapeTerbaru } from '@/lib/scraper';
export async function GET(req) {
  const page = parseInt(new URL(req.url).searchParams.get('page')) || 1;
  const data = await scrapeTerbaru(page);
  return NextResponse.json(data);
}
