import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';

export async function GET() {
  try {
    const matches = await getLpdbResults(500);
    const teamMap = new Map<string, { name: string; count: number }>();

    for (const m of matches) {
      for (const name of [m.team1, m.team2]) {
        if (!name) continue;
        const key = name.toLowerCase().trim();
        if (teamMap.has(key)) {
          teamMap.get(key)!.count++;
        } else {
          teamMap.set(key, { name, count: 1 });
        }
      }
    }

    const teams = Array.from(teamMap.values())
      .filter(t => t.count >= 2)
      .sort((a, b) => b.count - a.count)
      .map(t => t.name);

    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json({ teams: [] });
  }
}
