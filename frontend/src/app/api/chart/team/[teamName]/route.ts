import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';
import { buildTeamSeries, STOCK_START } from '@/lib/stockFormula';

const LPDB_ALIASES: Record<string, string> = {
  'navi': 'natus vincere',
  'gen.g': 'gen.g esports',
};

function nameMatches(lpdbName: string, query: string): boolean {
  const a = lpdbName.toLowerCase().trim();
  const b = query.toLowerCase().trim();
  if (a === b) return true;
  if (a.startsWith(b) || b.startsWith(a)) return true;
  if (LPDB_ALIASES[b] === a || LPDB_ALIASES[a] === b) return true;
  return false;
}

export async function GET(_req: Request, { params }: { params: Promise<{ teamName: string }> }) {
  const { teamName } = await params;
  const query = decodeURIComponent(teamName);

  try {
    const allMatches = await getLpdbResults(200);

    // Find canonical name as it appears in LPDB
    const canonical = allMatches.find(m =>
      nameMatches(m.team1, query) || nameMatches(m.team2, query)
    );
    const name = canonical
      ? (nameMatches(canonical.team1, query) ? canonical.team1 : canonical.team2)
      : query;

    const teamMatches = allMatches
      .filter(m =>
        m.date.startsWith('2026') && m.winner &&
        (nameMatches(m.team1, name) || nameMatches(m.team2, name))
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    if (teamMatches.length === 0) {
      return NextResponse.json({ chartData: [], current: STOCK_START, start: STOCK_START, matches: [], name });
    }

    const { chartData, current, start } = buildTeamSeries(teamMatches, name);

    const recentMatches = [...teamMatches].reverse().slice(0, 10).map(m => {
      const isTeam1 = nameMatches(m.team1, name);
      const opponent = isTeam1 ? m.team2 : m.team1;
      const myScore  = isTeam1 ? m.score1 : m.score2;
      const oppScore = isTeam1 ? m.score2 : m.score1;
      const won      = nameMatches(m.winner, name);
      return { date: m.date, opponent, myScore, oppScore, won, tournament: m.tournament };
    });

    return NextResponse.json({ chartData, current, start, matches: recentMatches, name });
  } catch {
    return NextResponse.json({ chartData: [], current: STOCK_START, start: STOCK_START, matches: [], name: query });
  }
}
