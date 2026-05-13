import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';

const KEYWORD_MAP: Record<string, string> = {
  americas: 'Americas',
  emea:     'EMEA',
  pacific:  'Pacific',
  china:    'China',
};

export async function GET(_req: Request, { params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const keyword = KEYWORD_MAP[region.toLowerCase()];
  if (!keyword) return NextResponse.json({ chartData: [], teams: [] });

  try {
    const allMatches = await getLpdbResults(200);
    const regional = allMatches
      .filter(m => m.tournament?.includes(keyword) && m.date.startsWith('2026') && m.winner)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (regional.length === 0) return NextResponse.json({ chartData: [], teams: [] });

    const winCounts: Record<string, number> = {};
    for (const m of regional) winCounts[m.winner] = (winCounts[m.winner] || 0) + 1;

    const topTeams = Object.entries(winCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);

    const scores: Record<string, number> = {};
    topTeams.forEach(t => { scores[t] = 100; });

    const weekMap = new Map<string, Record<string, number>>();
    for (const m of regional) {
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
