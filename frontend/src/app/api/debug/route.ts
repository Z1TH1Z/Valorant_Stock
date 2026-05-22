import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';

export async function GET() {
  try {
    const matches = await getLpdbResults(50);
    const teams2026 = [...new Set(
      matches
        .filter(m => m.date.startsWith('2026') && m.winner)
        .flatMap(m => [m.team1, m.team2])
    )];
    return NextResponse.json({
      total: matches.length,
      with2026: matches.filter(m => m.date.startsWith('2026') && m.winner).length,
      teams2026,
      first3: matches.slice(0, 3).map(m => ({ date: m.date, team1: m.team1, team2: m.team2, winner: m.winner, tournament: m.tournament })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
