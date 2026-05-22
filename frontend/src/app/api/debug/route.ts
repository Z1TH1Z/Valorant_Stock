import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.LPDB_API_KEY ?? '';
  if (!key) {
    return NextResponse.json({ error: 'LPDB_API_KEY not set in environment' });
  }

  const url = new URL('https://api.liquipedia.net/api/v3/match');
  url.searchParams.set('wiki', 'valorant');
  url.searchParams.set('conditions', '[[liquipediatier::1]] AND [[finished::1]]');
  url.searchParams.set('fields', 'match2id,date,match2opponents,winner,tournament');
  url.searchParams.set('limit', '10');
  url.searchParams.set('order', 'date desc');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Apikey ${key}`,
        Accept: 'application/json',
        'User-Agent': 'VCT-Performance-Tracker/1.0 (github.com/Z1TH1Z/Valorant_Stock)',
      },
    });

    const status = res.status;
    const body = await res.json().catch(() => ({}));

    return NextResponse.json({
      status,
      hasKey: true,
      keyPrefix: key.slice(0, 6) + '...',
      resultCount: body?.result?.length ?? 0,
      first3: (body?.result ?? []).slice(0, 3),
      error: body?.error ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, hasKey: true });
  }
}
