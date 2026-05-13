import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RegionChart } from '@/components/charts/RegionChart';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

const REGION_META: Record<string, { name: string; color: string; description: string }> = {
    americas: { name: 'Americas', color: 'text-red-400',    description: 'North America, Latin America, and Brazil' },
    emea:     { name: 'EMEA',     color: 'text-green-400',  description: 'Europe, Middle East, and Africa'          },
    pacific:  { name: 'Pacific',  color: 'text-cyan-400',   description: 'Asia-Pacific, Korea, Japan, and Southeast Asia' },
    china:    { name: 'China',    color: 'text-yellow-400', description: 'China Valorant league'                    },
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
            <div className="flex items-center gap-4">
                <Link href="/regions" className="p-2 hover:bg-surface rounded-full transition-colors">
                    <ArrowLeft className="text-muted hover:text-white" />
                </Link>
                <div>
                    <h1 className={`text-4xl font-tungsten uppercase tracking-wide ${meta.color}`}>{meta.name}</h1>
                    <p className="text-muted">{meta.description}</p>
                </div>
            </div>

            <RegionChart region={region} regionName={meta.name} />

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
                            <tr key={team.id ?? team.name} className="hover:bg-secondary transition-colors group">
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
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-muted">No teams found for this region.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
