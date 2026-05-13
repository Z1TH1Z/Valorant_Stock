import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';

export async function GET() {
  try {
    const allMatches = await getLpdbResults(200);
    const season = allMatches
      .filter(m => m.date.startsWith('2026') && m.winner)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (season.length === 0) return NextResponse.json({ chartData: [], teams: [] });

    const winCounts: Record<string, number> = {};
    for (const m of season) winCounts[m.winner] = (winCounts[m.winner] || 0) + 1;

    const topTeams = Object.entries(winCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const scores: Record<string, number> = {};
    topTeams.forEach(t => { scores[t] = 100; });

    const weekMap = new Map<string, Record<string, number>>();
    for (const m of season) {
      for (const side of [m.team1, m.team2]) {
        if (!topTeams.includes(side)) continue;
        scores[side] = m.winner === side ? scores[side] + 10 : scores[side] - 3;
      }
      const d = new Date(m.date);
      d.setDate(d.getDate() - d.getDay());
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weekMap.set(label, { ...scores });
    }

    const chartData = Array.from(weekMap.entries()).map(([week, snap]) => ({
      week,
      ...Object.fromEntries(topTeams.map(t => [t, Math.round(snap[t] ?? 100)])),
    }));

    return NextResponse.json({ chartData, teams: topTeams });
  } catch {
    return NextResponse.json({ chartData: [], teams: [] });
  }
}
