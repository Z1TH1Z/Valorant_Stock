import { NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';
import { buildStockSeries, STOCK_START } from '@/lib/stockFormula';

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
    const allMatches = await getLpdbResults(300);
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

    const { chartData, teams } = buildStockSeries(regional, topTeams);
    return NextResponse.json({ chartData, teams, startPrice: STOCK_START });
  } catch {
    return NextResponse.json({ chartData: [], teams: [] });
  }
}
