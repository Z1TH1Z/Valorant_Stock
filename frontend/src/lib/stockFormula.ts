export const STOCK_START = 100;

interface Match {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  winner: string;
  tournament: string;
  date: string;
}

/**
 * VCTrade Stock Formula
 *
 * Base delta by map score:
 *   Win 2-0  → +15  (dominant win)
 *   Win 2-1  → +10  (close win)
 *   Loss 1-2 → -5   (competitive loss)
 *   Loss 0-2 → -8   (shutout loss)
 *
 * Tournament multiplier:
 *   Champions / World Championship → ×1.5
 *   Masters                        → ×1.3
 *   Playoffs                       → ×1.1
 *   Regular season                 → ×1.0
 *
 * Floor: 50 (stock can't go below this)
 */
export function calcDelta(
  myScore: number,
  oppScore: number,
  isWinner: boolean,
  tournament: string,
): number {
  const base = isWinner
    ? (oppScore === 0 ? 15 : 10)
    : (myScore === 0 ? -8 : -5);

  const t = tournament.toLowerCase();
  let mult = 1.0;
  if (t.includes('champions') || t.includes('world championship')) mult = 1.5;
  else if (t.includes('masters'))  mult = 1.3;
  else if (t.includes('playoff'))  mult = 1.1;

  return Math.round(base * mult);
}

export function buildStockSeries(
  matches: Match[],
  teams: string[],
): { chartData: any[]; teams: string[] } {
  const scores: Record<string, number> = {};
  teams.forEach(t => { scores[t] = STOCK_START; });

  const weekMap = new Map<string, Record<string, number>>();

  for (const m of matches) {
    for (const side of [m.team1, m.team2]) {
      if (!teams.includes(side)) continue;
      const isWinner = m.winner === side;
      const myScore  = m.team1 === side ? m.score1 : m.score2;
      const oppScore = m.team1 === side ? m.score2 : m.score1;
      scores[side] = Math.max(50, scores[side] + calcDelta(myScore, oppScore, isWinner, m.tournament));
    }

    const d = new Date(m.date);
    d.setDate(d.getDate() - d.getDay());
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    weekMap.set(label, { ...scores });
  }

  const chartData = Array.from(weekMap.entries()).map(([week, snap]) => ({
    week,
    ...Object.fromEntries(teams.map(t => [t, snap[t] ?? STOCK_START])),
  }));

  return { chartData, teams };
}

export function buildTeamSeries(
  matches: Match[],
  teamName: string,
): { chartData: { week: string; price: number }[]; current: number; start: number } {
  let price = STOCK_START;
  const weekMap = new Map<string, number>();

  for (const m of matches) {
    const isTeam1 = m.team1.toLowerCase().trim() === teamName.toLowerCase().trim();
    const isTeam2 = m.team2.toLowerCase().trim() === teamName.toLowerCase().trim();
    if (!isTeam1 && !isTeam2) continue;

    const isWinner = m.winner.toLowerCase().trim() === teamName.toLowerCase().trim();
    const myScore  = isTeam1 ? m.score1 : m.score2;
    const oppScore = isTeam1 ? m.score2 : m.score1;
    price = Math.max(50, price + calcDelta(myScore, oppScore, isWinner, m.tournament));

    const d = new Date(m.date);
    d.setDate(d.getDate() - d.getDay());
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    weekMap.set(label, price);
  }

  const chartData = Array.from(weekMap.entries()).map(([week, p]) => ({ week, price: p }));
  return { chartData, current: price, start: STOCK_START };
}

export const FRANCHISE_TEAMS: { name: string; region: string }[] = [
  // Americas
  { name: 'Sentinels',      region: 'americas' },
  { name: 'NRG',            region: 'americas' },
  { name: 'Cloud9',         region: 'americas' },
  { name: 'LOUD',           region: 'americas' },
  { name: 'Leviatán',       region: 'americas' },
  { name: 'KRÜ Esports',    region: 'americas' },
  { name: '100 Thieves',    region: 'americas' },
  { name: 'Evil Geniuses',  region: 'americas' },
  { name: 'MIBR',           region: 'americas' },
  { name: '2Game Esports',  region: 'americas' },
  // EMEA
  { name: 'Fnatic',         region: 'emea' },
  { name: 'Team Liquid',    region: 'emea' },
  { name: 'NAVI',           region: 'emea' },
  { name: 'Giants',         region: 'emea' },
  { name: 'BBL Esports',    region: 'emea' },
  { name: 'Karmine Corp',   region: 'emea' },
  { name: 'Team Heretics',  region: 'emea' },
  { name: 'FUT Esports',    region: 'emea' },
  { name: 'GiantX',         region: 'emea' },
  { name: 'Mandragora',     region: 'emea' },
  { name: 'Team Vitality',  region: 'emea' },
  { name: 'Apeks',          region: 'emea' },
  // Pacific
  { name: 'Paper Rex',           region: 'pacific' },
  { name: 'ZETA DIVISION',       region: 'pacific' },
  { name: 'DRX',                 region: 'pacific' },
  { name: 'T1',                  region: 'pacific' },
  { name: 'Gen.G',               region: 'pacific' },
  { name: 'TALON',               region: 'pacific' },
  { name: 'Rex Regum Qeon',      region: 'pacific' },
  { name: 'BOOM Esports',        region: 'pacific' },
  { name: 'Global Esports',      region: 'pacific' },
  { name: 'Team Secret',         region: 'pacific' },
  { name: 'FULL SENSE',          region: 'pacific' },
  { name: 'Nongshim RedForce',   region: 'pacific' },
  // China
  { name: 'EDward Gaming',        region: 'china' },
  { name: 'FunPlus Phoenix',      region: 'china' },
  { name: 'Bilibili Gaming',      region: 'china' },
  { name: 'Wolves Esports',       region: 'china' },
  { name: 'Titan Esports Club',   region: 'china' },
  { name: 'Nova Esports',         region: 'china' },
  { name: 'Dragon Ranger Gaming', region: 'china' },
  { name: 'All Gamers',           region: 'china' },
  { name: 'XLG Esports',          region: 'china' },
  { name: 'Trace Esports',         region: 'china' },
];
