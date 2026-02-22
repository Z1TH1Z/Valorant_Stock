import { StockChart } from '@/components/charts/StockChart';
import { TrendingUp, TrendingDown, Clock, Zap, Newspaper, ExternalLink, Calendar, MapPin, DollarSign } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:3001';

async function getUpcomingMatches() {
  try {
    const res = await fetch(`${API_BASE}/api/matches/upcoming`, { cache: 'no-store' });
    const data = await res.json();
    return data.matches || [];
  } catch { return []; }
}

async function getMatchResults() {
  try {
    const res = await fetch(`${API_BASE}/api/matches/results`, { cache: 'no-store' });
    const data = await res.json();
    return data.results || [];
  } catch { return []; }
}

async function getLiveMatches() {
  try {
    const res = await fetch(`${API_BASE}/api/matches/live`, { cache: 'no-store' });
    const data = await res.json();
    return data.matches || [];
  } catch { return []; }
}

async function getNews() {
  try {
    const res = await fetch(`${API_BASE}/api/news`, { cache: 'no-store' });
    const data = await res.json();
    return data.articles || [];
  } catch { return []; }
}

async function getEvents() {
  try {
    const res = await fetch(`${API_BASE}/api/events`, { cache: 'no-store' });
    const data = await res.json();
    return data.events || [];
  } catch { return []; }
}

export default async function Home() {
  const [upcomingMatches, matchResults, liveMatches, news, events] = await Promise.all([
    getUpcomingMatches(),
    getMatchResults(),
    getLiveMatches(),
    getNews(),
    getEvents()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">
            Global Dashboard
          </h1>
          <p className="text-muted">Track top performing teams across all regions.</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-surface text-white text-sm font-medium rounded hover:bg-border-hover transition-colors">1W</button>
          <button className="px-4 py-2 bg-accent text-white text-sm font-medium rounded transition-colors">1M</button>
          <button className="px-4 py-2 bg-surface text-white text-sm font-medium rounded hover:bg-border-hover transition-colors">YTD</button>
        </div>
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
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{m.teamA}</span>
                  <span className="text-accent font-tungsten text-xl">{m.scoreA}</span>
                </div>
                <span className="text-xs text-muted">vs</span>
                <div className="flex items-center gap-3">
                  <span className="text-accent font-tungsten text-xl">{m.scoreB}</span>
                  <span className="font-bold text-white">{m.teamB}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Chart + Upcoming */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-primary border border-border rounded-lg p-6 h-[400px] flex flex-col">
          <h2 className="text-xl font-bold mb-4">Top 5 Teams Performance Index</h2>
          <div className="flex-1 w-full min-h-0">
            <StockChart />
          </div>
        </div>

        <div className="bg-primary border border-border rounded-lg p-6 h-[400px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-accent" /> Upcoming Matches
          </h2>
          <div className="space-y-3">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match: any) => (
                <MatchCard key={match.id} teamA={match.teamA} teamB={match.teamB} time={match.time} event={match.event} />
              ))
            ) : (
              <p className="text-muted text-sm">No tier 1 matches currently scheduled.</p>
            )}
          </div>
        </div>
      </div>

      {/* Match Results + News */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-primary border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-bull" /> Recent Match Results
          </h2>
          <div className="space-y-2">
            {matchResults.length > 0 ? (
              matchResults.slice(0, 8).map((r: any) => (
                <ResultRow key={r.id} {...r} />
              ))
            ) : (
              <p className="text-muted text-sm">No recent tier 1 results.</p>
            )}
          </div>
        </div>

        <div className="bg-primary border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Newspaper size={18} className="text-accent" /> VCT News
          </h2>
          <div className="space-y-4">
            {news.length > 0 ? (
              news.slice(0, 6).map((article: any, i: number) => (
                <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
                  className="block group">
                  <div className="text-sm font-medium text-white group-hover:text-accent transition-colors line-clamp-2">
                    {article.title}
                  </div>
                  <div className="text-xs text-muted mt-1 flex items-center gap-2">
                    {article.date} {article.author && `· ${article.author}`}
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

      {/* Upcoming International Events */}
      {events.length > 0 && (
        <div>
          <h2 className="text-2xl font-tungsten text-white uppercase tracking-wide mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-accent" /> Upcoming International Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 6).map((event: any, i: number) => (
              <a key={i} href={event.url} target="_blank" rel="noopener noreferrer"
                className="bg-primary border border-border rounded-lg overflow-hidden hover:border-border-hover transition-all group">
                {event.thumb && (
                  <div className="h-28 overflow-hidden bg-secondary">
                    <img src={event.thumb} alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${event.status === 'Ongoing' ? 'bg-bull/20 text-bull' :
                        event.status === 'Upcoming' ? 'bg-accent/20 text-accent' :
                          'bg-surface text-muted'
                      }`}>
                      {event.status || 'Scheduled'}
                    </span>
                    {event.region && (
                      <span className="text-[10px] text-muted flex items-center gap-1">
                        <MapPin size={8} /> {event.region}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-accent transition-colors line-clamp-2 mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">{event.dates}</span>
                    {event.prize && (
                      <span className="text-xs text-bull flex items-center gap-1">
                        <DollarSign size={10} /> {event.prize}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Live Matches" value={String(liveMatches.length)} trend={liveMatches.length > 0 ? 'LIVE' : '—'} positive={liveMatches.length > 0} />
        <StatCard title="Upcoming Matches" value={String(upcomingMatches.length)} trend="tier 1 only" positive={true} />
        <StatCard title="Recent Results" value={String(matchResults.length)} trend="last 24h" positive={true} />
        <StatCard title="Events" value={String(events.length)} trend="international" positive={true} />
      </div>
    </div>
  );
}

function MatchCard({ teamA, teamB, time, event }: { teamA: string; teamB: string; time: string, event: string }) {
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
  const aWon = parseInt(scoreA) > parseInt(scoreB);
  return (
    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border hover:border-border-hover transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <span className={`font-bold ${aWon ? 'text-bull' : 'text-white'}`}>{teamA}</span>
        <span className="font-tungsten text-lg text-white">{scoreA}</span>
        <span className="text-xs text-muted">-</span>
        <span className="font-tungsten text-lg text-white">{scoreB}</span>
        <span className={`font-bold ${!aWon ? 'text-bull' : 'text-white'}`}>{teamB}</span>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-accent font-medium truncate max-w-[200px]">{event}</div>
        <div className="text-[10px] text-muted">{timeCompleted}</div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, positive }: { title: string; value: string; trend: string; positive: boolean }) {
  return (
    <div className="bg-primary border border-border rounded-lg p-5 hover:border-border-hover transition-colors">
      <h3 className="text-sm text-muted font-medium mb-1">{title}</h3>
      <div className="text-3xl font-tungsten tracking-wide">{value}</div>
      <div className={`text-sm font-medium mt-2 flex items-center gap-1 ${positive ? 'text-bull' : 'text-muted'}`}>
        {positive && trend === 'LIVE' ? (
          <><div className="w-2 h-2 bg-accent rounded-full animate-pulse" /> <span className="text-accent">{trend}</span></>
        ) : (
          <>{positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {trend}</>
        )}
      </div>
    </div>
  );
}
