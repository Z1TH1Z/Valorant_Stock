import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';
import { buildTeamSeries, STOCK_START } from '@/lib/stockFormula';

export async function GET(_req: Request, { params }: { params: Promise<{ teamName: string }> }) {
  const { teamName } = await params;
  const name = decodeURIComponent(teamName);

  try {
    const allMatches = await getLpdbResults(500);
    const teamMatches = allMatches
      .filter(m =>
        m.date.startsWith('2026') && m.winner &&
        (m.team1.toLowerCase().trim() === name.toLowerCase().trim() ||
         m.team2.toLowerCase().trim() === name.toLowerCase().trim())
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    if (teamMatches.length === 0) {
      return NextResponse.json({ chartData: [], current: STOCK_START, start: STOCK_START, matches: [] });
    }

    const { chartData, current, start } = buildTeamSeries(teamMatches, name);

    const recentMatches = [...teamMatches].reverse().slice(0, 10).map(m => {
      const isTeam1 = m.team1.toLowerCase().trim() === name.toLowerCase().trim();
      const opponent = isTeam1 ? m.team2 : m.team1;
      const myScore  = isTeam1 ? m.score1 : m.score2;
      const oppScore = isTeam1 ? m.score2 : m.score1;
      const won      = m.winner.toLowerCase().trim() === name.toLowerCase().trim();
      return { date: m.date, opponent, myScore, oppScore, won, tournament: m.tournament };
    });

    return NextResponse.json({ chartData, current, start, matches: recentMatches });
  } catch {
    return NextResponse.json({ chartData: [], current: STOCK_START, start: STOCK_START, matches: [] });
  }
}
