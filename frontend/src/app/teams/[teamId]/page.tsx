import { ArrowLeft, Trophy, Target, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const API_BASE = 'http://127.0.0.1:3001';

async function getTeamData(teamName: string) {
    try {
        const res = await fetch(`${API_BASE}/api/teams`, { cache: 'no-store' });
        const data = await res.json();
        const teams = data.teams || [];
        const team = teams.find((t: any) => t.name.toLowerCase() === teamName.toLowerCase());
        const rank = team ? teams.indexOf(team) + 1 : 0;
        return { team, rank, allTeams: teams };
    } catch { return { team: null, rank: 0, allTeams: [] }; }
}

async function getRecentResults(teamName: string) {
    try {
        const res = await fetch(`${API_BASE}/api/matches/results`, { cache: 'no-store' });
        const data = await res.json();
        return (data.results || []).filter((m: any) =>
            m.teamA.toLowerCase() === teamName.toLowerCase() ||
            m.teamB.toLowerCase() === teamName.toLowerCase()
        ).slice(0, 10);
    } catch { return []; }
}

async function getUpcomingMatches(teamName: string) {
    try {
        const res = await fetch(`${API_BASE}/api/matches/upcoming`, { cache: 'no-store' });
        const data = await res.json();
        return (data.matches || []).filter((m: any) =>
            m.teamA.toLowerCase() === teamName.toLowerCase() ||
            m.teamB.toLowerCase() === teamName.toLowerCase()
        ).slice(0, 5);
    } catch { return []; }
}

const REGION_NAMES: Record<string, string> = {
    NA: 'Americas', EU: 'EMEA', AP: 'Pacific', CN: 'China'
};

export default async function TeamProfilePage({ params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;
    const teamName = decodeURIComponent(teamId);

    const [{ team, rank }, results, upcoming] = await Promise.all([
        getTeamData(teamName),
        getRecentResults(teamName),
        getUpcomingMatches(teamName)
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

    // Calculate stats from results
    const wins = results.filter((r: any) => {
        const isTeamA = r.teamA.toLowerCase() === teamName.toLowerCase();
        return isTeamA ? parseInt(r.scoreA) > parseInt(r.scoreB) : parseInt(r.scoreB) > parseInt(r.scoreA);
    }).length;
    const losses = results.length - wins;
    const winRate = results.length > 0 ? Math.round((wins / results.length) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/regions" className="p-2 hover:bg-surface rounded-full transition-colors">
                    <ArrowLeft className="text-muted hover:text-white" />
                </Link>
                <div className="flex items-center gap-4">
                    {team.logo && <img src={team.logo} alt={team.name} className="w-12 h-12 object-contain" />}
                    <div>
                        <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">{team.name}</h1>
                        <p className="text-muted">VCT {REGION_NAMES[team.region] || team.region} · Global Rank #{rank} · {team.record || 'No record'}</p>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-primary border border-border rounded-lg p-5">
                    <p className="text-sm text-muted mb-1">Global Rank</p>
                    <div className="text-4xl font-tungsten text-white">#{rank}</div>
                </div>
                <div className="bg-primary border border-border rounded-lg p-5">
                    <p className="text-sm text-muted mb-1">Win Rate</p>
                    <div className="text-4xl font-tungsten text-bull">{winRate}%</div>
                    <div className="text-xs text-muted mt-1">{wins}W - {losses}L (recent)</div>
                </div>
                <div className="bg-primary border border-border rounded-lg p-5">
                    <p className="text-sm text-muted mb-1">Record</p>
                    <div className="text-4xl font-tungsten text-white">{team.record || '—'}</div>
                </div>
                <div className="bg-primary border border-border rounded-lg p-5">
                    <p className="text-sm text-muted mb-1">Earnings</p>
                    <div className="text-4xl font-tungsten text-white">{team.earnings || '—'}</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Match History */}
                <div className="col-span-2 space-y-6">
                    <div className="bg-primary border border-border rounded-lg p-6">
                        <h2 className="text-2xl font-tungsten tracking-wide text-white border-b border-border pb-2 mb-6">Recent Match History</h2>
                        <div className="space-y-2">
                            {results.length > 0 ? results.map((r: any, i: number) => {
                                const isTeamA = r.teamA.toLowerCase() === teamName.toLowerCase();
                                const won = isTeamA ? parseInt(r.scoreA) > parseInt(r.scoreB) : parseInt(r.scoreB) > parseInt(r.scoreA);
                                const opponent = isTeamA ? r.teamB : r.teamA;
                                const score = isTeamA ? `${r.scoreA}-${r.scoreB}` : `${r.scoreB}-${r.scoreA}`;

                                return (
                                    <div key={i} className={`p-4 rounded-lg border flex items-center justify-between ${won ? 'border-bull/30 bg-bull/5' : 'border-bear/30 bg-bear/5'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${won ? 'bg-bull text-black' : 'bg-bear text-white'}`}>
                                                {won ? 'W' : 'L'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white">{score}</span>
                                                    <span className="text-muted text-sm">vs {opponent}</span>
                                                </div>
                                                <div className="text-[10px] text-accent mt-1">{r.event}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-muted">{r.timeCompleted || ''}</span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-muted text-sm py-4 text-center">No recent match results available.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upcoming Matches */}
                <div className="space-y-6">
                    <div className="bg-primary border border-border rounded-lg p-6">
                        <h2 className="text-2xl font-tungsten tracking-wide text-white border-b border-border pb-2 mb-6">Upcoming</h2>
                        {upcoming.length > 0 ? (
                            <div className="space-y-3">
                                {upcoming.map((m: any, i: number) => (
                                    <div key={i} className="p-3 bg-secondary rounded-lg border border-border">
                                        <div className="text-[10px] text-accent font-medium mb-1">{m.event}</div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-white text-sm">{m.teamA}</span>
                                            <span className="text-xs text-muted">vs</span>
                                            <span className="font-bold text-white text-sm">{m.teamB}</span>
                                        </div>
                                        <div className="text-[10px] text-muted mt-1">{m.time}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted text-sm text-center py-4">No upcoming matches.</p>
                        )}
                    </div>

                    {/* Quick Stats Card */}
                    <div className="bg-primary border border-border rounded-lg p-6">
                        <h2 className="text-2xl font-tungsten tracking-wide text-white border-b border-border pb-2 mb-6">Quick Stats</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted text-sm">Region</span>
                                <span className="text-white font-medium">{REGION_NAMES[team.region] || team.region}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted text-sm">Points</span>
                                <span className="text-white font-medium">{team.pts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted text-sm">Recent Form</span>
                                <div className="flex gap-1">
                                    {results.slice(0, 5).map((r: any, i: number) => {
                                        const isTeamA = r.teamA.toLowerCase() === teamName.toLowerCase();
                                        const won = isTeamA ? parseInt(r.scoreA) > parseInt(r.scoreB) : parseInt(r.scoreB) > parseInt(r.scoreA);
                                        return (
                                            <div key={i} className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${won ? 'bg-bull text-black' : 'bg-bear text-white'}`}>
                                                {won ? 'W' : 'L'}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
