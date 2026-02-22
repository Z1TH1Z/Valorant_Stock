import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as dotenv from 'dotenv';
dotenv.config();

const server = Fastify({ logger: true });

server.register(cors, { origin: '*' });

// --- External VLR API Wrapper ---
const VLR_API_BASE = 'http://127.0.0.1:8000';

// --- Tier 1 VCT Franchise Teams (exact vlrggapi names) ---
// Each VCT league maps to multiple vlrggapi sub-regions to find all franchise teams
interface VCTLeague {
  teams: string[];           // Exact team names from vlrggapi
  subRegions: string[];      // vlrggapi region codes to search
}

const VCT_LEAGUES: Record<string, VCTLeague> = {
  americas: {
    teams: [
      'NRG', 'G2 Esports', '100 Thieves', 'Cloud9', 'Sentinels',    // na
      'LEVIATÁN', 'KRÜ Esports',                                      // la-s
      'LOUD', 'FURIA', 'MIBR',                                        // br
      'Evil Geniuses'                                                  // na
    ],
    subRegions: ['na', 'br', 'la-s']
  },
  emea: {
    teams: [
      'BBL Esports', 'FNATIC', 'GIANTX', 'Team Heretics', 'Team Vitality',
      'Team Liquid', 'Gentle Mates', 'FUT Esports', 'Natus Vincere',
      'Karmine Corp', 'KOI'
    ],
    subRegions: ['eu']
  },
  pacific: {
    teams: [
      'Paper Rex', 'Rex Regum Qeon', 'Global Esports',                // ap
      'T1', 'Gen.G', 'DRX', 'Nongshim RedForce',                     // kr
      'ZETA DIVISION', 'DetonatioN FocusMe',                          // jp
      'BLEED', 'Talon Esports', 'Team Secret'                         // ap
    ],
    subRegions: ['ap', 'kr', 'jp']
  },
  china: {
    teams: [
      'EDward Gaming', 'Bilibili Gaming', 'Dragon Ranger Gaming',
      'TYLOO', 'JDG Esports', 'Trace Esports', 'FunPlus Phoenix',
      'Wolves Esports', 'All Gamers', 'Titan Esports Club', 'Nova Esports'
    ],
    subRegions: ['cn']
  }
};

// Build a flat set of all franchise team names for quick lookup
const ALL_TIER1_NAMES = new Set(
  Object.values(VCT_LEAGUES).flatMap(l => l.teams.map(n => n.toLowerCase()))
);

function isTier1Team(name: string): boolean {
  return ALL_TIER1_NAMES.has(name.toLowerCase().trim());
}

// Helper: safe fetch + JSON parse
async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Error: ${res.status} from ${url}`);
  return res.json();
}

// Helper: fetch all franchise teams for a VCT league from its sub-regions
async function fetchLeagueTeams(league: VCTLeague) {
  const allRanked: any[] = [];
  const seen = new Set<string>();

  for (const subRegion of league.subRegions) {
    try {
      const data = await fetchJSON(`${VLR_API_BASE}/rankings?region=${subRegion}`);
      if (data?.data) {
        for (const t of data.data) {
          const name = t.team?.trim();
          if (name && league.teams.some(ft => ft.toLowerCase() === name.toLowerCase()) && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            allRanked.push({
              id: t.id || name,
              name,
              rank: parseInt(t.rank) || 999,
              pts: t.points || 0,
              record: t.record || '',
              earnings: t.earnings || '',
              logo: t.logo ? `https:${t.logo}` : null,
              country: t.country || ''
            });
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch rankings for ${subRegion}:`, e);
    }
  }

  // Sort by vlrggapi rank (reflects qualification seeding)
  allRanked.sort((a, b) => a.rank - b.rank);

  // Re-assign clean 1-indexed rank
  allRanked.forEach((t, i) => { t.rank = i + 1; });

  // Add any franchise teams not found in rankings (at the bottom)
  for (const franchiseName of league.teams) {
    if (!seen.has(franchiseName.toLowerCase())) {
      allRanked.push({
        id: franchiseName,
        name: franchiseName,
        rank: allRanked.length + 1,
        pts: 0,
        record: '—',
        earnings: '—',
        logo: null,
        country: ''
      });
    }
  }

  return allRanked;
}

// ─── 1. Teams & Standings (All leagues aggregated) ───────
server.get('/api/teams', async () => {
  try {
    const allTeams = [];
    for (const [leagueName, league] of Object.entries(VCT_LEAGUES)) {
      const teams = await fetchLeagueTeams(league);
      allTeams.push(...teams.map(t => ({ ...t, region: leagueName.toUpperCase() })));
    }
    // Sort globally by vlrggapi rank (lower = better)
    allTeams.sort((a, b) => a.rank - b.rank);
    return { teams: allTeams };
  } catch (e) {
    console.error(e);
    return { teams: [] };
  }
});

// ─── 2. Regional Rankings ────────────────────────────────
server.get('/api/rankings/:region', async (req) => {
  try {
    const { region } = req.params as { region: string };
    const leagueKey = region.toLowerCase();
    const league = VCT_LEAGUES[leagueKey];
    if (!league) return { region: leagueKey, teams: [] };

    const teams = await fetchLeagueTeams(league);
    return { region: leagueKey, teams };
  } catch (e) {
    console.error(e);
    return { region: '', teams: [] };
  }
});

// ─── 3. Upcoming Matches (Tier 1 only) ──────────────────
server.get('/api/matches/upcoming', async () => {
  try {
    const data = await fetchJSON(`${VLR_API_BASE}/match?q=upcoming`);
    const segments = data?.data?.segments || [];

    const tier1Matches = segments
      .filter((m: any) => isTier1Team(m.team1) || isTier1Team(m.team2))
      .slice(0, 10)
      .map((m: any) => ({
        id: m.match_page || Math.random().toString(),
        teamA: m.team1,
        teamB: m.team2,
        flagA: m.flag1 || '',
        flagB: m.flag2 || '',
        time: m.time_until_match || '',
        event: m.match_event || '',
        series: m.match_series || '',
        matchPage: m.match_page || '',
        timestamp: m.unix_timestamp || ''
      }));

    return { matches: tier1Matches };
  } catch (e) {
    console.error(e);
    return { matches: [] };
  }
});

// ─── 4. Match Results ────────────────────────────────────
server.get('/api/matches/results', async () => {
  try {
    const data = await fetchJSON(`${VLR_API_BASE}/match?q=results`);
    const segments = data?.data?.segments || [];

    const results = segments
      .filter((m: any) => isTier1Team(m.team1) || isTier1Team(m.team2))
      .slice(0, 20)
      .map((m: any) => ({
        id: m.match_page || Math.random().toString(),
        teamA: m.team1,
        teamB: m.team2,
        scoreA: m.score1 || '0',
        scoreB: m.score2 || '0',
        flagA: m.flag1 || '',
        flagB: m.flag2 || '',
        event: m.match_event || '',
        matchPage: m.match_page || '',
        timeCompleted: m.time_completed || ''
      }));

    return { results };
  } catch (e) {
    console.error(e);
    return { results: [] };
  }
});

// ─── 5. Live Scores ──────────────────────────────────────
server.get('/api/matches/live', async () => {
  try {
    const data = await fetchJSON(`${VLR_API_BASE}/match?q=live_score`);
    const segments = data?.data?.segments || [];

    const live = segments
      .filter((m: any) => isTier1Team(m.team1) || isTier1Team(m.team2))
      .map((m: any) => ({
        id: m.match_page || Math.random().toString(),
        teamA: m.team1,
        teamB: m.team2,
        scoreA: m.score1 ?? '',
        scoreB: m.score2 ?? '',
        flagA: m.flag1 || '',
        flagB: m.flag2 || '',
        event: m.match_event || '',
        series: m.match_series || '',
        matchPage: m.match_page || '',
        currentMap: m.current_map || '',
        maps: m.maps || []
      }));

    return { matches: live };
  } catch (e) {
    console.error(e);
    return { matches: [] };
  }
});

// ─── 6. News ─────────────────────────────────────────────
server.get('/api/news', async () => {
  try {
    const data = await fetchJSON(`${VLR_API_BASE}/news`);
    const articles = (data?.data?.segments || []).slice(0, 10).map((a: any) => ({
      title: a.title || '',
      description: a.description || '',
      date: a.date || '',
      author: a.author || '',
      url: a.url_path ? `https://www.vlr.gg${a.url_path}` : ''
    }));
    return { articles };
  } catch (e) {
    console.error(e);
    return { articles: [] };
  }
});

// ─── 7. Events ───────────────────────────────────────────
server.get('/api/events', async () => {
  try {
    const data = await fetchJSON(`${VLR_API_BASE}/v2/events?q=upcoming`);
    const segments = data?.data?.segments || [];

    const events = segments.map((e: any) => ({
      title: e.title || '',
      status: e.status || '',
      prize: e.prize || '',
      dates: e.dates || '',
      region: e.region || '',
      thumb: e.thumb || '',
      url: e.url_path || ''
    }));

    return { events };
  } catch (e) {
    console.error(e);
    return { events: [] };
  }
});

// ─── 8. Health ───────────────────────────────────────────
server.get('/health', async () => ({ status: 'ok' }));

// ─── Start Server ────────────────────────────────────────
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`✓ Fastify Server running on port ${port} wrapping VLR Python API`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
