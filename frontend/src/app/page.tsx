import { StockChart } from '@/components/charts/StockChart';
import { Clock, Zap, Newspaper, ExternalLink } from 'lucide-react';
import { VLR_BASE, isTier1Event } from '@/lib/tier1';

async function getUpcomingMatches() {
  try {
    const [homeData, extData] = await Promise.allSettled([
      fetch(`${VLR_BASE}/match?q=upcoming`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${VLR_BASE}/match?q=upcoming_extended&num_pages=2`, { cache: 'no-store' }).then(r => r.json()),
    ]);
    const home = homeData.status === 'fulfilled' ? homeData.value?.data?.segments ?? [] : [];
    const ext  = extData.status  === 'fulfilled' ? extData.value?.data?.segments  ?? [] : [];
    const seen = new Set<string>();
    const all: any[] = [];
    for (const seg of [...home, ...ext]) {
      const page = seg.match_page ?? '';
      if (!seen.has(page)) { seen.add(page); all.push(seg); }
    }
    return all
      .filter((m: any) => isTier1Event(m.match_event ?? ''))
      .slice(0, 30)
      .map((m: any) => ({
        id: m.match_page || Math.random().toString(),
        teamA: m.team1, teamB: m.team2,
        time: m.time_until_match || '',
        event: m.match_event || '',
      }));
  } catch { return []; }
}

async function getMatchResults() {
  try {
    const data = await fetch(`${VLR_BASE}/match?q=results&num_pages=2`, { cache: 'no-store' }).then(r => r.json());
    return (data?.data?.segments ?? [])
      .filter((m: any) => isTier1Event(m.tournament_name ?? ''))
      .slice(0, 8)
      .map((m: any) => ({
        id: m.match_page || Math.random().toString(),
        teamA: m.team1, teamB: m.team2,
        scoreA: m.score1 || '0', scoreB: m.score2 || '0',
        event: m.tournament_name || '',
        timeCompleted: m.time_completed || '',
      }));
  } catch { return []; }
}

async function getLiveMatches() {
  try {
    const data = await fetch(`${VLR_BASE}/match?q=live_score`, { cache: 'no-store' }).then(r => r.json());
    return (data?.data?.segments ?? [])
      .filter((m: any) => isTier1Event(m.match_event ?? ''))
      .map((m: any) => ({
        id: m.match_page || Math.random().toString(),
        teamA: m.team1, teamB: m.team2,
        scoreA: m.score1 ?? '', scoreB: m.score2 ?? '',
        event: m.match_event || '',
      }));
  } catch { return []; }
}

async function getNews() {
  try {
    const data = await fetch(`${VLR_BASE}/news`, { cache: 'no-store' }).then(r => r.json());
    return (data?.data?.segments ?? []).slice(0, 5).map((a: any) => ({
      title: a.title || '',
      description: a.description || '',
      date: a.date || '',
      author: a.author || '',
      url: a.url_path ? `https://www.vlr.gg${a.url_path}` : '',
    }));
  } catch { return []; }
}

export default async function Home() {
  const [upcomingMatches, matchResults, liveMatches, news] = await Promise.all([
    getUpcomingMatches(),
    getMatchResults(),
    getLiveMatches(),
    getNews(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">Global Dashboard</h1>
        <p className="text-muted">Track top performing teams across all regions.</p>
      </div>

      {/* Live Matches Banner */}
      {liveMatches.length > 0 && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-accent font-bold text-sm uppercase tracking-wider">Live Now</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveMatches.slice(0, 3).map((m: any) => (
              <div key={m.id} className="flex items-center justify-between bg-primary border border-border rounded-lg p-3">
                <span className="font-bold text-white">{m.teamA}</span>
                <span className="font-tungsten text-xl text-accent">{m.scoreA} – {m.scoreB}</span>
                <span className="font-bold text-white">{m.teamB}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart + Upcoming */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-primary border border-border rounded-lg p-6 h-[400px] flex flex-col">
          <h2 className="text-xl font-bold mb-4">Top 5 Teams — Performance Index</h2>
          <div className="flex-1 w-full min-h-0">
            <StockChart />
          </div>
        </div>

        <div className="bg-primary border border-border rounded-lg p-6 h-[400px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-accent" /> Upcoming
          </h2>
          <div className="space-y-3">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((m: any) => (
                <MatchCard key={m.id} teamA={m.teamA} teamB={m.teamB} time={m.time} event={m.event} />
              ))
            ) : (
              <p className="text-muted text-sm">No tier 1 matches scheduled.</p>
            )}
          </div>
        </div>
      </div>

      {/* Results + News */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-primary border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-bull" /> Recent Results
          </h2>
          <div className="space-y-2">
            {matchResults.length > 0 ? (
              matchResults.slice(0, 8).map((r: any, i: number) => (
                <ResultRow key={r.id ?? i} {...r} />
              ))
            ) : (
              <p className="text-muted text-sm">No recent tier 1 results.</p>
            )}
          </div>
        </div>

        <div className="bg-primary border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Newspaper size={18} className="text-accent" /> News
          </h2>
          <div className="space-y-4">
            {news.length > 0 ? (
              news.slice(0, 5).map((a: any, i: number) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="text-sm font-medium text-white group-hover:text-accent transition-colors line-clamp-2">
                    {a.title}
                  </div>
                  <div className="text-xs text-muted mt-1 flex items-center gap-1">
                    {a.date}{a.author && ` · ${a.author}`}
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))
            ) : (
              <p className="text-muted text-sm">No news available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ teamA, teamB, time, event }: { teamA: string; teamB: string; time: string; event: string }) {
  return (
    <div className="flex flex-col p-3 bg-secondary rounded-lg border border-border hover:border-border-hover transition-colors">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider truncate max-w-[60%]">{event}</span>
        <span className="text-[10px] text-muted whitespace-nowrap">{time}</span>
      </div>
      <div className="flex justify-between items-center">
        <div className="font-bold text-white max-w-[40%] truncate">{teamA}</div>
        <div className="text-xs text-muted font-tungsten tracking-widest">VS</div>
        <div className="font-bold text-white max-w-[40%] truncate text-right">{teamB}</div>
      </div>
    </div>
  );
}

function ResultRow({ teamA, teamB, scoreA, scoreB, event, timeCompleted }: any) {
  const aWon = (parseInt(scoreA) || 0) > (parseInt(scoreB) || 0);
  return (
    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border hover:border-border-hover transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <span className={`font-bold ${aWon ? 'text-bull' : 'text-white'}`}>{teamA}</span>
        <span className="font-tungsten text-lg text-white">{scoreA} – {scoreB}</span>
        <span className={`font-bold ${!aWon ? 'text-bull' : 'text-white'}`}>{teamB}</span>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[10px] text-accent font-medium truncate max-w-[160px]">{event}</div>
        <div className="text-[10px] text-muted">{timeCompleted}</div>
      </div>
    </div>
  );
}
