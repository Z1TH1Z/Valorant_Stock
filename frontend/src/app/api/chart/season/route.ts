import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';
import { buildStockSeries, STOCK_START } from '@/lib/stockFormula';

export async function GET() {
  try {
    const allMatches = await getLpdbResults(500);
    const season = allMatches.filter(m => m.winner)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (season.length === 0) return NextResponse.json({ chartData: [], teams: [] });

    const winCounts: Record<string, number> = {};
    for (const m of season) winCounts[m.winner] = (winCounts[m.winner] || 0) + 1;

    const topTeams = Object.entries(winCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const { chartData, teams } = buildStockSeries(season, topTeams);
    return NextResponse.json({ chartData, teams, startPrice: STOCK_START });
  } catch {
    return NextResponse.json({ chartData: [], teams: [] });
  }
}
