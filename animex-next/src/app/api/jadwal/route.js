import { NextResponse } from 'next/server';
import { scrapeJadwal } from '@/lib/scraper';
export async function GET() {
  const data = await scrapeJadwal();
  return NextResponse.json(data);
}
