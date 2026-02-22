'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trophy, TrendingUp, Medal, TrendingDown } from 'lucide-react';

// Deterministic pseudo-random generator (seeded by day so it's consistent per day)
function seededRandom(seed: number) {
    let s = seed;
    return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
    };
}

const REGIONS = ['Global', 'Americas', 'EMEA', 'Pacific', 'China'] as const;

const NAMES = [
    'PredictorGod', 'ViperOneTrick', 'JettDash12', 'OmenSmoke', 'SageWall99',
    'ChambersAce', 'RazeBlast', 'PhoenixRise', 'YoruTP', 'KillJoy101',
    'CypherCam', 'BrimstoneHQ', 'NeonSlide', 'FadeHunt', 'BreachFlash',
    'AstraStars', 'SkyeSeek', 'SovaArrow', 'KayoSuppress', 'GeckoGlob',
    'HarborWave', 'DeadlockNet', 'VyseBlock', 'CloveSelf', 'IsoKill',
    'ValoGrinder', 'RadiantPush', 'ImmortalStrat', 'AscendantAwp', 'DiamondPeek'
];

interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    accuracy: number;
    weeklyChange: number;
    region: string;
}

function generateLeaderboard(): LeaderboardEntry[] {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const rand = seededRandom(seed);

    const regionPool = ['Americas', 'EMEA', 'Pacific', 'China'];

    return NAMES.map((name, i) => ({
        rank: i + 1,
        name,
        score: Math.round(25400 - i * 350 + (rand() - 0.5) * 200),
        accuracy: Math.round(85 - i * 1.5 + (rand() - 0.5) * 10),
        weeklyChange: Math.round((rand() - 0.3) * 500),
        region: regionPool[Math.floor(rand() * regionPool.length)]
    }));
}

export default function LeaderboardsPage() {
    const [activeRegion, setActiveRegion] = useState<typeof REGIONS[number]>('Global');
    const [userScore, setUserScore] = useState(0);

    const leaderboard = useMemo(() => generateLeaderboard(), []);

    useEffect(() => {
        try {
            const predictions = JSON.parse(localStorage.getItem('vct_predictions') || '[]');
            setUserScore(predictions.length * 130);
        } catch { setUserScore(0); }
    }, []);

    const filtered = activeRegion === 'Global'
        ? leaderboard
        : leaderboard.filter(e => e.region === activeRegion);

    // Insert user into leaderboard
    const userRank = filtered.findIndex(e => e.score < userScore);
    const showUserRow = userScore > 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">Global Leaderboards</h1>
                    <p className="text-muted">See how your prediction accuracy stacks up against the world.</p>
                </div>
                <div className="flex space-x-2">
                    {REGIONS.map(r => (
                        <button
                            key={r}
                            onClick={() => setActiveRegion(r)}
                            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${activeRegion === r
                                    ? 'bg-accent text-white'
                                    : 'bg-surface text-white hover:bg-border-hover'
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top 3 Podium */}
            {filtered.length >= 3 && (
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <TopRankCard rank={2} entry={filtered[1]} accent="from-gray-400/20 to-transparent" border="border-gray-400/50" color="text-gray-400" />
                    <TopRankCard rank={1} entry={filtered[0]} accent="from-yellow-400/20 to-transparent" border="border-yellow-400/50" color="text-yellow-400" />
                    <TopRankCard rank={3} entry={filtered[2]} accent="from-amber-700/20 to-transparent" border="border-amber-700/50" color="text-amber-700" />
                </div>
            )}

            {/* Table */}
            <div className="bg-primary border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-secondary text-muted text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">Rank</th>
                            <th className="px-6 py-4 font-medium">Username</th>
                            <th className="px-6 py-4 font-medium">Accuracy</th>
                            <th className="px-6 py-4 font-medium text-right">Total Score</th>
                            <th className="px-6 py-4 font-medium text-right">Weekly Change</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.slice(3).map((entry, i) => {
                            const isUser = showUserRow && i + 3 === (userRank >= 0 ? userRank : -1);
                            return (
                                <tr key={entry.name}
                                    className={`hover:bg-secondary transition-colors ${isUser ? 'bg-accent/10 border-l-2 border-l-accent' : ''}`}>
                                    <td className="px-6 py-4 font-tungsten text-xl text-muted">#{entry.rank}</td>
                                    <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs">
                                            {entry.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        {entry.name}
                                        <span className="text-[10px] text-muted bg-surface px-2 py-0.5 rounded">{entry.region}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                                            <div className="h-full bg-bull rounded-full" style={{ width: `${entry.accuracy}%` }} />
                                        </div>
                                        <span className="text-xs text-muted">{entry.accuracy}%</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white text-right">{entry.score.toLocaleString()}</td>
                                    <td className={`px-6 py-4 text-sm font-medium text-right flex items-center justify-end gap-1 ${entry.weeklyChange >= 0 ? 'text-bull' : 'text-bear'}`}>
                                        {entry.weeklyChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {entry.weeklyChange >= 0 ? '+' : ''}{entry.weeklyChange}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* User Row */}
                        {showUserRow && (
                            <tr className="bg-accent/10 border-l-2 border-l-accent">
                                <td className="px-6 py-4 font-tungsten text-xl text-accent">#{userRank >= 0 ? userRank + 1 : filtered.length + 1}</td>
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
                                        NT
                                    </div>
                                    Nithin
                                    <span className="text-xs bg-accent text-white px-2 py-0.5 rounded">YOU</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                                        <div className="h-full bg-accent rounded-full" style={{ width: '72%' }} />
                                    </div>
                                    <span className="text-xs text-muted">72%</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-accent text-right">{userScore.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm font-medium text-right text-bull flex items-center justify-end gap-1">
                                    <TrendingUp size={14} /> +{userScore}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TopRankCard({ rank, entry, accent, border, color }: {
    rank: number; entry: LeaderboardEntry; accent: string; border: string; color: string;
}) {
    const isFirst = rank === 1;
    return (
        <div className={`relative overflow-hidden bg-primary border ${border} rounded-xl p-6 flex flex-col items-center text-center ${isFirst ? 'scale-105 z-10 shadow-2xl shadow-yellow-500/10' : 'mt-4'}`}>
            <div className={`absolute inset-0 bg-gradient-to-b ${accent} opacity-30`} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-secondary border-2 flex justify-center items-center mb-4" style={{ borderColor: 'inherit' }}>
                <Medal className={color} size={32} />
            </div>
            <h3 className="relative z-10 text-xl font-bold text-white mb-1">{entry.name}</h3>
            <div className="relative z-10 text-4xl font-tungsten text-white tracking-widest">{entry.score.toLocaleString()}</div>
            <div className="relative z-10 text-sm text-bull font-medium mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> +{entry.weeklyChange}
            </div>
            <div className="relative z-10 text-xs text-muted mt-1">{entry.accuracy}% accuracy</div>
        </div>
    );
}
