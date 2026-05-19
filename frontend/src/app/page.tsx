'use client';

import { useState, useEffect, useMemo } from 'react';
import { RegionChart } from '@/components/charts/RegionChart';
import { Clock } from 'lucide-react';

const REGIONS = [
  { key: 'americas', label: 'Americas', keyword: 'americas' },
  { key: 'emea',     label: 'EMEA',     keyword: 'emea' },
  { key: 'pacific',  label: 'Pacific',  keyword: 'pacific' },
  { key: 'china',    label: 'China',    keyword: 'china' },
];

function isIntlEvent(event: string) {
  const e = event.toLowerCase();
  if (e.includes('qualifier') || e.includes('challengers') || e.includes('ascent')) return false;
  return e.includes('masters') || e.includes('valorant champions') || e.includes('esports world cup');
}

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState('americas');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (p: Promise<any>, fallback: any) =>
      Promise.race([p, new Promise(res => setTimeout(() => res(fallback), 8000))]).catch(() => fallback);

    Promise.all([
      safe(fetch('/api/matches/upcoming').then(r => r.json()), { matches: [] }),
      safe(fetch('/api/matches/results').then(r => r.json()),  { results: [] }),
    ]).then(([upData, resData]) => {
      setUpcoming(upData.matches || []);
      setResults(resData.results || []);
    }).finally(() => setLoading(false));
  }, []);

  const regionInfo = REGIONS.find(r => r.key === selectedRegion)!;

  const regionalUpcoming = useMemo(() =>
    upcoming.filter(m => (m.event ?? '').toLowerCase().includes(regionInfo.keyword)),
    [upcoming, regionInfo]
  );

  const regionalResults = useMemo(() =>
    results.filter(m => (m.event ?? '').toLowerCase().includes(regionInfo.keyword)),
    [results, regionInfo]
  );

  const intlUpcoming = useMemo(() => upcoming.filter(m => isIntlEvent(m.event ?? '')), [upcoming]);
  const intlResults  = useMemo(() => results.filter(m => isIntlEvent(m.event ?? '')),  [results]);

  const intlEvents = useMemo(() => {
    const seen = new Set<string>();
    [...intlUpcoming, ...intlResults].forEach(m => { if (m.event) seen.add(m.event); });
    return Array.from(seen);
  }, [intlUpcoming, intlResults]);

  useEffect(() => {
    if (intlEvents.length > 0 && !selectedEvent) setSelectedEvent(intlEvents[0]);
  }, [intlEvents, selectedEvent]);

  const filteredIntl = useMemo(() =>
    [...intlUpcoming.map(m => ({ ...m, type: 'upcoming' })), ...intlResults.map(m => ({ ...m, type: 'result' }))]
      .filter(m => m.event === selectedEvent),
    [intlUpcoming, intlResults, selectedEvent]
  );

  return (
    <div className="space-y-10">
      {/* Region Tabs */}
      <div>
        <div className="flex gap-1 border-b border-border mb-6">
          {REGIONS.map(r => (
            <button
              key={r.key}
              onClick={() => setSelectedRegion(r.key)}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                selectedRegion === r.key
                  ? 'border-accent text-white'
                  : 'border-transparent text-muted hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide mb-1">
          {regionInfo.label} Dashboard
        </h1>
        <p className="text-muted text-sm mb-6">VCT franchise standings and upcoming matches.</p>

        <div className="grid grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="col-span-2">
            <RegionChart regionName={regionInfo.label} region={selectedRegion} />
          </div>

          {/* Upcoming for this region */}
          <div className="bg-primary border border-border rounded-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} className="text-accent" /> Upcoming
              </h2>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-16 bg-surface rounded animate-pulse" />)
              ) : regionalUpcoming.length > 0 ? (
                regionalUpcoming.slice(0, 8).map((m: any) => (
                  <MatchCard key={m.id} {...m} />
                ))
              ) : (
                <p className="text-muted text-sm">No upcoming matches.</p>
              )}
            </div>
          </div>
        </div>

        {/* Regional Results */}
        {!loading && regionalResults.length > 0 && (
          <div className="mt-6 bg-primary border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-bold text-white text-sm uppercase tracking-wider">Recent Results</h2>
            </div>
            <div className="divide-y divide-border/40">
              {regionalResults.slice(0, 6).map((r: any, i: number) => (
                <ResultRow key={i} {...r} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* International Events */}
      <div>
        <h2 className="text-2xl font-tungsten text-white uppercase tracking-wide mb-4">International Events</h2>

        {loading ? (
          <div className="h-20 bg-surface rounded animate-pulse" />
        ) : intlEvents.length > 0 ? (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {intlEvents.map(evt => (
                <button
                  key={evt}
                  onClick={() => setSelectedEvent(evt)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    selectedEvent === evt
                      ? 'bg-accent border-accent text-white'
                      : 'bg-transparent border-border text-muted hover:text-white hover:border-border-hover'
                  }`}
                >
                  {evt}
                </button>
              ))}
            </div>

            {filteredIntl.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredIntl.slice(0, 12).map((m: any, i: number) =>
                  m.type === 'result'
                    ? <ResultRow key={i} {...m} />
                    : <MatchCard key={i} {...m} />
                )}
              </div>
            ) : (
              <p className="text-muted text-sm">No matches for this event yet.</p>
            )}
          </>
        ) : (
          <p className="text-muted text-sm">No international events currently active.</p>
        )}
      </div>
    </div>
  );
}

function MatchCard({ teamA, teamB, time, event }: any) {
  return (
    <div className="p-3 bg-secondary border border-border rounded-lg hover:border-border-hover transition-colors">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider truncate max-w-[65%]">{event}</span>
        <span className="text-[10px] text-muted whitespace-nowrap">{time}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-bold text-white text-sm truncate max-w-[40%]">{teamA}</span>
        <span className="text-xs text-muted font-tungsten tracking-widest">VS</span>
        <span className="font-bold text-white text-sm truncate max-w-[40%] text-right">{teamB}</span>
      </div>
    </div>
  );
}

function ResultRow({ teamA, teamB, scoreA, scoreB, event, timeCompleted }: any) {
  const aWon = (parseInt(scoreA) || 0) > (parseInt(scoreB) || 0);
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-surface/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className={`font-bold text-sm truncate ${aWon ? 'text-bull' : 'text-white'}`}>{teamA}</span>
        <span className="font-tungsten text-lg text-white shrink-0">{scoreA} – {scoreB}</span>
        <span className={`font-bold text-sm truncate ${!aWon ? 'text-bull' : 'text-white'}`}>{teamB}</span>
      </div>
      <div className="text-right shrink-0 ml-4">
        <div className="text-[10px] text-accent font-medium truncate max-w-[180px]">{event}</div>
        <div className="text-[10px] text-muted">{timeCompleted}</div>
      </div>
    </div>
  );
}
