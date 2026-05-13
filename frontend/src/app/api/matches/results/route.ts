import { NextResponse } from 'next/server';
import { VLR_BASE, isTier1Team, ensureTier1Loaded } from '@/lib/tier1';

export async function GET() {
  try {
    await ensureTier1Loaded();
    const data = await fetch(`${VLR_BASE}/match?q=results&num_pages=2`).then(r => r.json());
    const results = (data?.data?.segments ?? [])
      .filter((m: any) => isTier1Team(m.team1) || isTier1Team(m.team2))
      .slice(0, 30)
      .map((m: any) => ({
        id: m.match_page || Math.random().toString(),
        teamA: m.team1,
        teamB: m.team2,
        scoreA: m.score1 || '0',
        scoreB: m.score2 || '0',
        flagA: m.flag1 || '',
        flagB: m.flag2 || '',
        event: m.match_event || '',
        matchPage: m.match_page || '',
        timeCompleted: m.time_completed || '',
      }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
