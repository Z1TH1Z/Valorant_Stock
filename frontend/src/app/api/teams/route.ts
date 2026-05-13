import { NextResponse } from 'next/server';
import { getLeagueTeams, VCT_LEAGUE_KEYS, ensureTier1Loaded } from '@/lib/tier1';

export async function GET() {
  try {
    await ensureTier1Loaded();
    const allTeams = [];
    for (const key of VCT_LEAGUE_KEYS) {
      const teams = await getLeagueTeams(key);
      allTeams.push(...teams.map(t => ({ ...t, region: key.toUpperCase() })));
    }
    allTeams.sort((a, b) => a.rank - b.rank);
    return NextResponse.json({ teams: allTeams });
  } catch {
    return NextResponse.json({ teams: [] });
  }
}
