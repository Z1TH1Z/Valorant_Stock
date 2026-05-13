import { NextResponse } from 'next/server';
import { VLR_BASE, isTier1Team, ensureTier1Loaded } from '@/lib/tier1';

export async function GET() {
  try {
    await ensureTier1Loaded();
    const [homeData, extData] = await Promise.allSettled([
      fetch(`${VLR_BASE}/match?q=upcoming`).then(r => r.json()),
      fetch(`${VLR_BASE}/match?q=upcoming_extended&num_pages=2`).then(r => r.json()),
    ]);

    const home = homeData.status === 'fulfilled' ? homeData.value?.data?.segments ?? [] : [];
    const ext  = extData.status  === 'fulfilled' ? extData.value?.data?.segments  ?? [] : [];

    const seen = new Set<string>();
    const all: any[] = [];
    for (const seg of [...home, ...ext]) {
      const page = seg.match_page ?? '';
      if (!seen.has(page)) { seen.add(page); all.push(seg); }
    }

    const matches = all
      .filter((m: any) => isTier1Team(m.team1) || isTier1Team(m.team2))
      .slice(0, 30)
      .map((m: any) => ({
        id: m.match_page || Math.random().toString(),
        teamA: m.team1,
        teamB: m.team2,
        flagA: m.flag1 || '',
        flagB: m.flag2 || '',
        time: m.time_until_match || '',
        event: m.match_event || '',
        series: m.match_series || '',
        matchPage: m.match_page || '',
        timestamp: m.unix_timestamp || '',
      }));

    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [] });
  }
}
