export const VLR_BASE = process.env.VLRGG_API_URL ?? 'http://127.0.0.1:8000';

interface VCTLeague { teams: string[]; }

const VCT_LEAGUES: Record<string, VCTLeague> = {
  americas: { teams: [] },
  emea:     { teams: [] },
  pacific:  { teams: [] },
  china:    { teams: [] },
};

let ALL_TIER1_NAMES = new Set<string>();
let tier1Loaded = false;
let tier1Promise: Promise<void> | null = null;

let rankingsCache = new Map<string, any>();
let rankingsCacheLoaded = false;
let rankingsPromise: Promise<void> | null = null;

async function safeFetch(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function regionOf(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('americas')) return 'americas';
  if (t.includes('emea'))     return 'emea';
  if (t.includes('pacific'))  return 'pacific';
  if (t.includes('china'))    return 'china';
  return '';
}

async function doLoadTier1() {
  for (const league of Object.values(VCT_LEAGUES)) league.teams = [];
  const newSet = new Set<string>();

  try {
    const eventsData = await safeFetch(`${VLR_BASE}/v2/events`);
    const allEvents: any[] = eventsData?.data?.segments ?? [];
    const vctEvents = allEvents.filter((e: any) => {
      const t = (e.title ?? '').toLowerCase();
      return (t.startsWith('vct 20') || t.includes('valorant masters') || t.includes('valorant champions'))
        && (regionOf(e.title) || t.includes('masters') || t.includes('champions'));
    });

    for (const event of vctEvents) {
      const m = (event.url_path ?? '').match(/\/event\/(\d+)\//);
      if (!m) continue;
      const region = regionOf(event.title);
      if (!region) continue;
      const league = VCT_LEAGUES[region];
      try {
        const md = await safeFetch(`${VLR_BASE}/events/matches?event_id=${m[1]}`);
        for (const seg of md?.data?.segments ?? []) {
          for (const name of [seg.team1?.name?.trim(), seg.team2?.name?.trim()]) {
            if (name && !newSet.has(name.toLowerCase())) {
              newSet.add(name.toLowerCase());
              league.teams.push(name);
            }
          }
        }
      } catch { /* skip failed event */ }
    }
  } catch (e) {
    console.error('[tier1] Event scan failed:', e);
  }

  // Fallback: scan upcoming + results
  try {
    const [up, res] = await Promise.allSettled([
      safeFetch(`${VLR_BASE}/match?q=upcoming`),
      safeFetch(`${VLR_BASE}/match?q=results`),
    ]);
    const segs = [
      ...(up.status === 'fulfilled' ? up.value?.data?.segments ?? [] : []),
      ...(res.status === 'fulfilled' ? res.value?.data?.segments ?? [] : []),
    ];
    for (const seg of segs) {
      const evt: string = seg.match_event ?? '';
      const region = regionOf(evt);
      if (!region) continue;
      if (!evt.toLowerCase().includes('vct') && !evt.toLowerCase().includes('champions')) continue;
      for (const name of [seg.team1?.trim(), seg.team2?.trim()]) {
        if (name && !newSet.has(name.toLowerCase())) {
          newSet.add(name.toLowerCase());
          VCT_LEAGUES[region].teams.push(name);
        }
      }
    }
  } catch { /* fallback failed */ }

  ALL_TIER1_NAMES = newSet;
  tier1Loaded = true;
}

export async function ensureTier1Loaded() {
  if (tier1Loaded) return;
  if (tier1Promise) return tier1Promise;
  tier1Promise = doLoadTier1().finally(() => { tier1Promise = null; });
  return tier1Promise;
}

async function doLoadRankings() {
  const regions = ['na', 'br', 'la-s', 'la-n', 'eu', 'ap', 'kr', 'jp', 'cn', 'oce', 'mn'];
  const results = await Promise.allSettled(
    regions.map(r => safeFetch(`${VLR_BASE}/rankings?region=${r}`))
  );
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const t of result.value?.data?.data ?? []) {
      const name: string = t.team?.trim();
      if (name && !rankingsCache.has(name.toLowerCase())) {
        rankingsCache.set(name.toLowerCase(), {
          id: t.id || name,
          name,
          rank: parseInt(t.rank) || 999,
          pts: t.points || 0,
          record: t.record || '',
          earnings: t.earnings || '',
          logo: t.logo ? `https:${t.logo}` : null,
          country: t.country || '',
        });
      }
    }
  }
  rankingsCacheLoaded = true;
}

async function ensureRankingsLoaded() {
  if (rankingsCacheLoaded) return;
  if (rankingsPromise) return rankingsPromise;
  rankingsPromise = doLoadRankings().finally(() => { rankingsPromise = null; });
  return rankingsPromise;
}

export function isTier1Team(name: string): boolean {
  return ALL_TIER1_NAMES.has(name.toLowerCase().trim());
}

export async function getLeagueTeams(leagueKey: string) {
  await Promise.all([ensureTier1Loaded(), ensureRankingsLoaded()]);
  const league = VCT_LEAGUES[leagueKey];
  if (!league) return [];

  const seen = new Set<string>();
  const teams: any[] = [];
  for (const teamName of league.teams) {
    const key = teamName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const cached = rankingsCache.get(key);
    teams.push(cached
      ? { ...cached }
      : { id: teamName, name: teamName, rank: 999, pts: 0, record: '—', earnings: '—', logo: null, country: '' }
    );
  }
  teams.sort((a, b) => a.rank - b.rank);
  teams.forEach((t, i) => { t.rank = i + 1; });
  return teams;
}

export const VCT_LEAGUE_KEYS = Object.keys(VCT_LEAGUES);
