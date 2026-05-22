import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';
import { FRANCHISE_TEAMS } from '@/lib/stockFormula';

export async function GET() {
  const known = new Set(FRANCHISE_TEAMS.map(t => t.name.toLowerCase()));

  const matches = await getLpdbResults(200);
  const vctMatches = matches.filter(m =>
    m.date.startsWith('2026') && m.winner &&
    m.tournament.toLowerCase().includes('vct 2026')
  );

  const teamTournaments = new Map<string, Set<string>>();
  for (const m of vctMatches) {
    for (const name of [m.team1, m.team2]) {
      if (!teamTournaments.has(name)) teamTournaments.set(name, new Set());
      teamTournaments.get(name)!.add(m.tournament);
    }
  }

  const allVctTeams = Array.from(teamTournaments.entries()).map(([name, tourneys]) => ({
    name,
    tournaments: Array.from(tourneys),
    inOurList: known.has(name.toLowerCase()),
  })).sort((a, b) => a.name.localeCompare(b.name));

  const missing = allVctTeams.filter(t => !t.inOurList);

  return NextResponse.json({ vctMatchCount: vctMatches.length, allVctTeams, missing });
}
