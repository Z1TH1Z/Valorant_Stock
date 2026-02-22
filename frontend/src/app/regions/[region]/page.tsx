import { ArrowLeft, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { RegionChart } from '@/components/charts/RegionChart';

const API_BASE = 'http://127.0.0.1:3001';

const REGION_META: Record<string, { name: string; color: string; description: string }> = {
    americas: { name: 'Americas', color: 'text-red-400', description: 'North America, Latin America, and Brazil' },
    emea: { name: 'EMEA', color: 'text-green-400', description: 'Europe, Middle East, and Africa' },
    pacific: { name: 'Pacific', color: 'text-cyan-400', description: 'Asia-Pacific, Korea, Japan, and Southeast Asia' },
    china: { name: 'China', color: 'text-yellow-400', description: 'China Valorant league' },
};

async function getRegionTeams(region: string) {
    try {
        const res = await fetch(`${API_BASE}/api/rankings/${region}`, { cache: 'no-store' });
        const data = await res.json();
        return data.teams || [];
    } catch { return []; }
}

export default async function RegionDetailPage({ params }: { params: Promise<{ region: string }> }) {
    const { region } = await params;
    const meta = REGION_META[region] || { name: region, color: 'text-white', description: '' };
    const teams = await getRegionTeams(region);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/regions" className="p-2 hover:bg-surface rounded-full transition-colors">
                    <ArrowLeft className="text-muted hover:text-white" />
                </Link>
                <div>
                    <h1 className={`text-4xl font-tungsten uppercase tracking-wide ${meta.color}`}>{meta.name}</h1>
                    <p className="text-muted">{meta.description}</p>
                </div>
            </div>

            {/* Top 3 Podium */}
            {teams.length >= 3 && (
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {[teams[1], teams[0], teams[2]].map((team: any, i: number) => {
                        const rank = [2, 1, 3][i];
                        const isFirst = rank === 1;
                        const borderColor = rank === 1 ? 'border-yellow-400/50' : rank === 2 ? 'border-gray-400/50' : 'border-amber-700/50';
                        const textColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : 'text-amber-700';
                        return (
                            <Link key={team.id} href={`/teams/${encodeURIComponent(team.name)}`}
                                className={`relative overflow-hidden bg-primary border ${borderColor} rounded-xl p-6 flex flex-col items-center text-center hover:border-opacity-100 transition-all ${isFirst ? 'scale-105 z-10 shadow-2xl shadow-yellow-500/10' : 'mt-4'}`}>
                                <div className={`w-16 h-16 rounded-full bg-secondary border-2 ${borderColor} flex justify-center items-center mb-4`}>
                                    <Trophy className={textColor} size={28} />
                                </div>
                                <div className={`font-tungsten text-lg ${textColor}`}>#{rank}</div>
                                <h3 className="text-lg font-bold text-white mt-1">{team.name}</h3>
                                {team.logo && <img src={team.logo} alt={team.name} className="w-8 h-8 mt-2 object-contain" />}
                                <div className="text-sm text-muted mt-2">{team.record || 'No record'}</div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Regional Performance Chart */}
            <RegionChart teams={teams} regionName={meta.name} />

            {/* Full Standings Table */}
            <div className="bg-primary border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-secondary text-muted text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium w-16">#</th>
                            <th className="px-6 py-4 font-medium">Team</th>
                            <th className="px-6 py-4 font-medium">Record</th>
                            <th className="px-6 py-4 font-medium">Earnings</th>
                            <th className="px-6 py-4 font-medium text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {teams.map((team: any) => (
                            <tr key={team.id} className="hover:bg-secondary transition-colors group">
                                <td className="px-6 py-4 font-tungsten text-xl text-muted">#{team.rank}</td>
                                <td className="px-6 py-4">
                                    <Link href={`/teams/${encodeURIComponent(team.name)}`} className="flex items-center gap-3">
                                        {team.logo && <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" />}
                                        <span className="font-bold text-white group-hover:text-accent transition-colors">{team.name}</span>
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted">{team.record || '—'}</td>
                                <td className="px-6 py-4 text-sm text-muted">{team.earnings || '—'}</td>
                                <td className="px-6 py-4 font-bold text-white text-right">{team.pts}</td>
                            </tr>
                        ))}
                        {teams.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No teams found for this region.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
