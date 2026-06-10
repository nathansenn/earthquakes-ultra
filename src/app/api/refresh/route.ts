import { NextRequest, NextResponse } from 'next/server';
import { refreshEarthquakeData, getRefreshStatus } from '@/lib/data-refresh';

export const dynamic = 'force-dynamic';

// GET /api/refresh — refresh status + data freshness (read-only, public)
export async function GET() {
  return NextResponse.json(getRefreshStatus(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}

// POST /api/refresh — trigger a refresh now (protected when SCRAPER_API_KEY is set)
export async function POST(request: NextRequest) {
  const expectedKey = process.env.SCRAPER_API_KEY;
  if (expectedKey && request.headers.get('x-api-key') !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await refreshEarthquakeData('api');
  return NextResponse.json(result, {
    status: result.success ? 200 : 502,
    headers: { 'Cache-Control': 'no-store' },
  });
}
