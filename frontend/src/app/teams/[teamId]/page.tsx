import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

const REGION_NAMES: Record<string, string> = {
    AMERICAS: 'Americas',
    EMEA: 'EMEA',
    PACIFIC: 'Pacific',
    CHINA: 'China',
};

async function getTeamData(teamName: string) {
    try {
        const res = await fetch(`${API_BASE}/api/teams`, { cache: 'no-store' });
        const data = await res.json();
        const teams = data.teams || [];
        const team = teams.find((t: any) => t.name.toLowerCase() === teamName.toLowerCase());
        return { team, rank: team ? teams.indexOf(team) + 1 : 0 };
    } catch { return { team: null, rank: 0 }; }
}

async function getRecentResults(teamName: string) {
    const lower = teamName.toLowerCase();
    try {
        const [vlrRes, lpdbRes] = await Promise.all([
            fetch(`${API_BASE}/api/matches/results`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ results: [] })),
            fetch(`${API_BASE}/api/lpdb/results?limit=200`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ matches: [] })),
        ]);

        const vlr = (vlrRes.results || [])
            .filter((m: any) => m.teamA?.toLowerCase() === lower || m.teamB?.toLowerCase() === lower)
            .map((m: any) => ({ teamA: m.teamA, teamB: m.teamB, scoreA: m.scoreA, scoreB: m.scoreB, event: m.event, timeCompleted: m.timeCompleted || '' }));

        const lpdb = (lpdbRes.matches || [])
            .filter((m: any) => m.team1?.toLowerCase() === lower || m.team2?.toLowerCase() === lower)
            .map((m: any) => ({ teamA: m.team1, teamB: m.team2, scoreA: String(m.score1), scoreB: String(m.score2), event: m.tournament, timeCompleted: m.date?.slice(0, 10) || '' }));

        const seen = new Set<string>();
        const merged: any[] = [];
        for (const r of [...vlr, ...lpdb]) {
            const key = [r.teamA, r.teamB, r.scoreA, r.scoreB].join('|').toLowerCase();
            if (!seen.has(key)) { seen.add(key); merged.push(r); }
        }
        return merged.slice(0, 12);
    } catch { return []; }
}

async function getUpcomingMatches(teamName: string) {
    try {
        const res = await fetch(`${API_BASE}/api/matches/upcoming`, { cache: 'no-store' });
        const data = await res.json();
        return (data.matches || []).filter((m: any) =>
            m.teamA?.toLowerCase() === teamName.toLowerCase() ||
            m.teamB?.toLowerCase() === teamName.toLowerCase()
        ).slice(0, 5);
    } catch { return []; }
}

export default async function TeamProfilePage({ params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;
    const teamName = decodeURIComponent(teamId);

    const [{ team, rank }, results, upcoming] = await Promise.all([
        getTeamData(teamName),
        getRecentResults(teamName),
        getUpcomingMatches(teamName),
    ]);

    if (!team) {
        return (
            <div className="space-y-6">
                <Link href="/regions" className="flex items-center gap-2 text-muted hover:text-white transition-colors">
                    <ArrowLeft size={20} /> Back to Regions
                </Link>
                <div className="bg-primary border border-border rounded-lg p-12 text-center">
                    <h1 className="text-3xl font-tungsten text-white mb-4">Team Not Found</h1>
                    <p className="text-muted">Could not find data for &quot;{teamName}&quot;.</p>
                </div>
            </div>
        );
    }

    const wins = results.filter((r: any) => {
        const isA = r.teamA.toLowerCase() === teamName.toLowerCase();
        return isA ? parseInt(r.scoreA) > parseInt(r.scoreB) : parseInt(r.scoreB) > parseInt(r.scoreA);
    }).length;
    const losses = results.length - wins;
    const winRate = results.length > 0 ? Math.round((wins / results.length) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/regions" className="p-2 hover:bg-surface rounded-full transition-colors">
                    <ArrowLeft className="text-muted hover:text-white" />
                </Link>
                <div className="flex items-center gap-4">
                    {team.logo && <img src={team.logo} alt={team.name} className="w-12 h-12 object-contain" />}
                    <div>
                        <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">{team.name}</h1>
                        <p className="text-muted text-sm">
                            VCT {REGION_NAMES[team.region] || team.region} · Global #{rank} · {team.record || 'No record'}
                            {team.pts ? ` · ${team.pts} pts` : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-primary border border-border rounded-lg p-5">
                    <p className="text-xs text-muted mb-1">Recent Win Rate</p>
                    <div className="text-3xl font-tungsten text-bull">{winRate}%</div>
                    <div className="text-xs text-muted mt-1">{wins}W – {losses}L (recent)</div>
                </div>
                <div className="bg-primary border border-border rounded-lg p-5">
                    <p className="text-xs text-muted mb-1">Season Record</p>
                    <div className="text-3xl font-tungsten text-white">{team.record || '—'}</div>
                </div>
                <div className="bg-primary border border-border rounded-lg p-5">
                    <p className="text-xs text-muted mb-1">Earnings</p>
                    <div className="text-3xl font-tungsten text-white">{team.earnings || '—'}</div>
                </div>
            </div>

            {/* Match history + Upcoming */}
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-primary border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Match History</h2>
                    <div className="space-y-2">
                        {results.length > 0 ? results.map((r: any, i: number) => {
                            const isA = r.teamA.toLowerCase() === teamName.toLowerCase();
                            const won = isA ? parseInt(r.scoreA) > parseInt(r.scoreB) : parseInt(r.scoreB) > parseInt(r.scoreA);
                            const opponent = isA ? r.teamB : r.teamA;
                            const score = isA ? `${r.scoreA}–${r.scoreB}` : `${r.scoreB}–${r.scoreA}`;
                            return (
                                <div key={i} className={`p-4 rounded-lg border flex items-center justify-between ${won ? 'border-bull/30 bg-bull/5' : 'border-bear/30 bg-bear/5'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${won ? 'bg-bull text-black' : 'bg-bear text-white'}`}>
                                            {won ? 'W' : 'L'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-sm">{score}</span>
                                                <span className="text-muted text-sm">vs {opponent}</span>
                                            </div>
                                            <div className="text-[10px] text-accent mt-0.5">{r.event}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted">{r.timeCompleted}</span>
                                </div>
                            );
                        }) : (
                            <p className="text-muted text-sm py-4 text-center">No recent match results available.</p>
                        )}
                    </div>
                </div>

                <div className="bg-primary border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Upcoming</h2>
                    {upcoming.length > 0 ? (
                        <div className="space-y-3">
                            {upcoming.map((m: any, i: number) => (
                                <div key={i} className="p-3 bg-secondary rounded-lg border border-border">
                                    <div className="text-[10px] text-accent font-medium mb-1">{m.event}</div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-white">{m.teamA}</span>
                                        <span className="text-xs text-muted">vs</span>
                                        <span className="font-bold text-white">{m.teamB}</span>
                                    </div>
                                    <div className="text-[10px] text-muted mt-1">{m.time}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-sm text-center py-4">No upcoming matches.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
