const LPDB_BASE = 'https://api.liquipedia.net/api/v3';
const LPDB_WIKI = 'valorant';

const getApiKey = () => process.env.LPDB_API_KEY ?? '';

interface CacheEntry { data: any; expires: number; }
const cache = new Map<string, CacheEntry>();

const TTL = {
  results:     5 * 60 * 1000,
  tournaments: 10 * 60 * 1000,
  standings:   5 * 60 * 1000,
  placements:  30 * 60 * 1000,
};

let lastRequestAt = 0;
const RATE_LIMIT_MS = 1_100;

async function waitForRateLimit(): Promise<void> {
  const gap = Date.now() - lastRequestAt;
  if (gap < RATE_LIMIT_MS) {
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS - gap));
  }
  lastRequestAt = Date.now();
}

async function lpdbFetch(endpoint: string, params: Record<string, string>): Promise<any[]> {
  const key = getApiKey();
  if (!key) {
    console.warn('[LPDB] LPDB_API_KEY not set — skipping request');
    return [];
  }

  const url = new URL(`${LPDB_BASE}/${endpoint}`);
  url.searchParams.set('wiki', LPDB_WIKI);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const cacheKey = url.toString();
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.data;

  await waitForRateLimit();

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        Authorization: `Apikey ${key}`,
        Accept: 'application/json',
        'User-Agent': 'VCT-Performance-Tracker/1.0 (github.com/Z1TH1Z/Valorant_Stock)',
      },
    });
  } catch (err) {
    console.error('[LPDB] Network error:', err);
    return [];
  }

  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    console.warn(`[LPDB] Rate limited (429):`, body?.error?.[0] ?? '');
    return [];
  }
  if (!res.ok) {
    console.error(`[LPDB] HTTP ${res.status} from ${url}`);
    return [];
  }

  const json = await res.json();
  const data: any[] = json?.result ?? [];
  const ttl = TTL[endpoint as keyof typeof TTL] ?? TTL.results;
  cache.set(cacheKey, { data, expires: Date.now() + ttl });
  return data;
}

export interface LpdbMatch {
  id: string;
  date: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  winner: string;
  tournament: string;
}

export async function getLpdbResults(limit = 100): Promise<LpdbMatch[]> {
  const rows = await lpdbFetch('match', {
    conditions: '[[liquipediatier::1||2]] AND [[finished::1]]',
    fields: 'match2id,date,match2opponents,winner,tournament',
    limit: String(limit),
    order: 'date desc',
  });

  return rows.map((r): LpdbMatch => {
    const opponents: any[] = r.match2opponents ?? [];
    const team1 = opponents[0]?.name ?? '';
    const team2 = opponents[1]?.name ?? '';
    const winner = r.winner === '1' ? team1 : r.winner === '2' ? team2 : '';
    return {
      id: r.match2id ?? '',
      date: r.date ?? '',
      team1,
      team2,
      score1: Number(opponents[0]?.score ?? 0),
      score2: Number(opponents[1]?.score ?? 0),
      winner,
      tournament: r.tournament ?? '',
    };
  });
}

export interface LpdbTournament {
  name: string;
  startDate: string;
  endDate: string;
  prizepool: string;
  status: string;
  tier: string;
  region: string;
}

export async function getLpdbTournaments(limit = 30): Promise<LpdbTournament[]> {
  const rows = await lpdbFetch('tournament', {
    conditions: '[[liquipediatier::1]]',
    fields: 'name,startdate,enddate,prizepool,status,liquipediatier,location',
    limit: String(limit),
    order: 'startdate desc',
  });
  return rows.map((r): LpdbTournament => ({
    name: r.name ?? '',
    startDate: r.startdate ?? '',
    endDate: r.enddate ?? '',
    prizepool: r.prizepool ?? '',
    status: r.status ?? '',
    tier: r.liquipediatier ?? '',
    region: r.location ?? '',
  }));
}

export interface LpdbStandingsEntry {
  placement: number;
  team: string;
  points: number;
  wins: number;
  losses: number;
}

export async function getLpdbStandings(tournamentName: string): Promise<LpdbStandingsEntry[]> {
  const rows = await lpdbFetch('standingsentry', {
    conditions: `[[tournament::${tournamentName}]]`,
    fields: 'placement,team,points,wins,losses',
    limit: '20',
    order: 'placement asc',
  });
  return rows.map((r): LpdbStandingsEntry => ({
    placement: Number(r.placement ?? 0),
    team: r.team ?? '',
    points: Number(r.points ?? 0),
    wins: Number(r.wins ?? 0),
    losses: Number(r.losses ?? 0),
  }));
}

export interface LpdbPlacement {
  date: string;
  placement: number;
  tournament: string;
  prizepool: string;
}

export async function getLpdbTeamHistory(teamName: string, limit = 20): Promise<LpdbPlacement[]> {
  const rows = await lpdbFetch('placement', {
    conditions: `[[participant::${teamName}]] AND [[liquipediatier::1]]`,
    fields: 'date,placement,tournament,prizepool',
    limit: String(limit),
    order: 'date asc',
  });
  return rows.map((r): LpdbPlacement => ({
    date: r.date ?? '',
    placement: Number(r.placement ?? 0),
    tournament: r.tournament ?? '',
    prizepool: r.prizepool ?? '',
  }));
}
