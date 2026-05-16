import { NextResponse } from 'next/server';
import { VLR_BASE, isTier1Event } from '@/lib/tier1';

export async function GET() {
  try {
    const data = await fetch(`${VLR_BASE}/match?q=live_score`).then(r => r.json());
    const matches = (data?.data?.segments ?? [])
      .filter((m: any) => isTier1Event(m.match_event ?? ''))
      .map((m: any) => ({
        id: m.match_page || Math.random().toString(),
        teamA: m.team1,
        teamB: m.team2,
        scoreA: m.score1 ?? '',
        scoreB: m.score2 ?? '',
        flagA: m.flag1 || '',
        flagB: m.flag2 || '',
        event: m.match_event || '',
        series: m.match_series || '',
        matchPage: m.match_page || '',
        currentMap: m.current_map || '',
        maps: m.maps || [],
      }));
    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [] });
  }
}
