import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const team = url.searchParams.get('team') ?? 'Paper Rex';

  const t0 = Date.now();
  try {
    const matches = await getLpdbResults(200);
    const elapsed = Date.now() - t0;

    const teamMatches = matches.filter(m =>
      m.date.startsWith('2026') && m.winner &&
      (m.team1.toLowerCase().includes(team.toLowerCase()) || m.team2.toLowerCase().includes(team.toLowerCase()))
    );

    return NextResponse.json({
      total: matches.length,
      elapsed_ms: elapsed,
      teamMatchCount: teamMatches.length,
      teamMatches: teamMatches.slice(0, 5).map(m => ({
        date: m.date, team1: m.team1, team2: m.team2,
        score1: m.score1, score2: m.score2, winner: m.winner, tournament: m.tournament,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, elapsed_ms: Date.now() - t0 });
  }
}
