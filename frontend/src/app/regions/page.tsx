import { ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

const REGIONS = [
    { id: 'americas', name: 'Americas', color: 'border-red-500/50',    tournament: 'Americas' },
    { id: 'emea',     name: 'EMEA',     color: 'border-green-500/50',  tournament: 'EMEA'     },
    { id: 'pacific',  name: 'Pacific',  color: 'border-cyan-500/50',   tournament: 'Pacific'  },
    { id: 'china',    name: 'China',    color: 'border-yellow-500/50', tournament: 'China'    },
];

async function getRegionData() {
    try {
        const [teamsRes, lpdbRes] = await Promise.all([
            fetch(`${API_BASE}/api/teams`, { cache: 'no-store' }).then(r => r.json()),
            fetch(`${API_BASE}/api/lpdb/results?limit=200`, { cache: 'no-store' }).then(r => r.json()),
        ]);
        return { teams: teamsRes.teams ?? [], matches: lpdbRes.matches ?? [] };
    } catch { return { teams: [], matches: [] }; }
}

export default async function RegionsPage() {
    const { teams, matches } = await getRegionData();

    const regionData = REGIONS.map(region => {
        const regionTeams = teams.filter((t: any) => t.region === region.id.toUpperCase());
        const matchesPlayed = matches.filter(
            (m: any) => m.tournament?.includes(region.tournament) && m.winner
        ).length;
        return {
            ...region,
            topTeam: regionTeams[0]?.name || 'TBD',
            totalTeams: regionTeams.length,
            matchesPlayed,
        };
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">VCT Regions</h1>
                <p className="text-muted">Select a region to view standings and performance.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {regionData.map(region => (
                    <Link key={region.id} href={`/regions/${region.id}`}
                        className={`group relative bg-primary border ${region.color} rounded-xl p-6 hover:border-opacity-80 transition-all overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                                    <Globe size={20} className="text-muted" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-tungsten text-white tracking-widest uppercase">{region.name}</h2>
                                    <p className="text-sm text-muted">
                                        {region.totalTeams > 0 ? `${region.totalTeams} Franchise Teams` : 'Loading…'}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="text-gray-500 group-hover:text-white transition-colors" />
                        </div>

                        <div className="relative z-10 border-t border-border pt-4 flex justify-between">
                            <div>
                                <p className="text-xs text-muted mb-1">#1 Seed</p>
                                <p className="text-base font-bold text-white">{region.topTeam}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted mb-1">Matches Played</p>
                                <p className="text-base font-bold text-white">
                                    {region.matchesPlayed > 0 ? region.matchesPlayed : '—'}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
