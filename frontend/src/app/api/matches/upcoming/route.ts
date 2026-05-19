import { NextResponse } from 'next/server';
import { VLR_BASE, isFranchiseTeam } from '@/lib/tier1';

export async function GET() {
  try {
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
      .filter((m: any) => {
        const t1 = (m.team1 ?? '').trim().toLowerCase();
        const t2 = (m.team2 ?? '').trim().toLowerCase();
        if (!t1 || !t2 || t1 === 'tbd' || t2 === 'tbd') return false;
        return isFranchiseTeam(t1) || isFranchiseTeam(t2);
      })
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
