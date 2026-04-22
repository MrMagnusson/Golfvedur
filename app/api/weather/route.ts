import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather, fetchWeatherMetNo, fetchWeatherVedur } from '@/lib/weather';

// Node.js runtime required — Edge Runtime silently drops next: { revalidate }
// in fetch, which means every request hits met.no with no caching.
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lon = parseFloat(searchParams.get('lon') ?? '');
  const source = searchParams.get('source') ?? 'auto';

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'Missing lat/lon' }, { status: 400 });
  }

  try {
    let weather;
    if (source === 'metno') {
      weather = await fetchWeatherMetNo(lat, lon);
    } else if (source === 'vedur') {
      weather = await fetchWeatherVedur(lat, lon);
    } else {
      weather = await fetchWeather(lat, lon); // auto: met.no → vedur.is fallback
    }

    return NextResponse.json(weather, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('Weather fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
