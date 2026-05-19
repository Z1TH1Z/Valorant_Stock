import { NextResponse } from 'next/server';

const VLR_BASE = process.env.VLRGG_API_URL ?? 'http://127.0.0.1:8000';

const LEAGUE_REGIONS: Record<string, string[]> = {
  americas: ['na', 'br', 'la-s', 'la-n'],
  emea:     ['eu', 'mn'],
  pacific:  ['ap', 'kr', 'jp'],
  china:    ['cn'],
};

export async function GET(_req: Request, { params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const vlrRegions = LEAGUE_REGIONS[region.toLowerCase()];
  if (!vlrRegions) return NextResponse.json({ teams: [] });

  try {
    const results = await Promise.allSettled(
      vlrRegions.map(r => fetch(`${VLR_BASE}/rankings?region=${r}`, { cache: 'no-store' }).then(res => res.json()))
    );

    const seen = new Set<string>();
    const teams: any[] = [];
    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      for (const t of result.value?.data ?? []) {
        const name: string = (t.team ?? '').trim();
        if (!name || seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());
        teams.push({
          id: name,
          name,
          rank: parseInt(t.rank) || 999,
          pts: t.points || 0,
          record: t.record || '—',
          logo: t.logo ? `https:${t.logo}` : null,
          country: t.country || '',
        });
      }
    }

    teams.sort((a, b) => a.rank - b.rank);
    teams.forEach((t, i) => { t.rank = i + 1; });
    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json({ teams: [] });
  }
}
