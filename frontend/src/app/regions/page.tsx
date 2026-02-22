import { TrendingUp, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';

const API_BASE = 'http://127.0.0.1:3001';

const REGIONS = [
    { id: 'americas', name: 'Americas', color: 'border-red-500/50', teams: 11, code: 'na' },
    { id: 'emea', name: 'EMEA', color: 'border-green-500/50', teams: 11, code: 'eu' },
    { id: 'pacific', name: 'Pacific', color: 'border-cyan-500/50', teams: 11, code: 'ap' },
    { id: 'china', name: 'China', color: 'border-yellow-500/50', teams: 11, code: 'cn' },
];

async function getGlobalRankings() {
    try {
        const res = await fetch(`${API_BASE}/api/teams`, { cache: 'no-store' });
        const data = await res.json();
        return data.teams || [];
    } catch { return []; }
}

export default async function RegionsPage() {
    const globalTeams = await getGlobalRankings();

    const regionData = REGIONS.map(region => {
        const regionTeams = globalTeams.filter((t: any) => t.region === region.code.toUpperCase());
        const topTeam = regionTeams[0]?.name || 'TBD';
        const totalTeams = regionTeams.length;
        return { ...region, topTeam, totalTeams };
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">VCT Regions Hub</h1>
                    <p className="text-muted">Deep dive into specific regional leagues, standings, and performance metrics.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {regionData.map((region) => (
                    <Link key={region.id} href={`/regions/${region.id}`}
                        className={`group relative bg-primary border ${region.color} rounded-xl p-6 hover:border-opacity-80 transition-all cursor-pointer overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity`} />

                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                                    <Globe size={20} className="text-muted" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-tungsten text-white tracking-widest uppercase">{region.name}</h2>
                                    <p className="text-sm text-muted">{region.totalTeams || region.teams} Franchise Teams</p>
                                </div>
                            </div>
                            <ArrowRight className="text-gray-500 group-hover:text-white transition-colors" />
                        </div>

                        <div className="relative z-10 border-t border-border pt-6 mt-4 flex justify-between">
                            <div>
                                <p className="text-sm text-muted mb-1">#1 Seed (Current)</p>
                                <p className="text-lg font-bold text-white tracking-wide">{region.topTeam}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted mb-1">Total Matches Played</p>
                                <p className="text-lg font-bold text-white">42</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Global Leaderboard */}
            <div className="mt-12">
                <h2 className="text-2xl font-tungsten text-white uppercase tracking-wide mb-6">Global Circuit Points Leaderboard</h2>
                <div className="bg-primary border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-secondary text-muted text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Rank</th>
                                <th className="px-6 py-4 font-medium">Team</th>
                                <th className="px-6 py-4 font-medium">Region</th>
                                <th className="px-6 py-4 font-medium">Record</th>
                                <th className="px-6 py-4 font-medium text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {globalTeams.slice(0, 15).map((team: any, i: number) => (
                                <tr key={team.id || i} className="hover:bg-secondary transition-colors">
                                    <td className="px-6 py-4 font-tungsten text-xl text-muted">#{i + 1}</td>
                                    <td className="px-6 py-4">
                                        <Link href={`/teams/${encodeURIComponent(team.name)}`} className="font-bold text-white hover:text-accent transition-colors">
                                            {team.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted">{team.region}</td>
                                    <td className="px-6 py-4 text-sm text-muted">{team.record || '—'}</td>
                                    <td className="px-6 py-4 font-bold text-white text-right">{team.pts}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
