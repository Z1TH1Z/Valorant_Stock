import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';

export async function GET() {
  try {
    const matches = await getLpdbResults(20);
    return NextResponse.json({
      count: matches.length,
      first5: matches.slice(0, 5),
      teams: [...new Set(matches.flatMap(m => [m.team1, m.team2]))].slice(0, 30),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
