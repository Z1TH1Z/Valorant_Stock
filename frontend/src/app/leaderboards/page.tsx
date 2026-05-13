'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    id: string;
    username: string;
    totalScore: number;
    correct: number;
    resolved: number;
    accuracy: number;
}

export default function LeaderboardsPage() {
    const { data: session } = useSession();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leaderboard')
            .then(r => r.json())
            .then(d => setLeaderboard(d.leaderboard ?? []))
            .catch(() => setLeaderboard([]))
            .finally(() => setLoading(false));
    }, []);

    const userId = (session?.user as any)?.id;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">Leaderboards</h1>
                <p className="text-muted">See how your prediction accuracy stacks up.</p>
            </div>

            {loading ? (
                <div className="bg-primary border border-border rounded-lg p-12 text-center">
                    <div className="text-muted animate-pulse">Loading…</div>
                </div>
            ) : leaderboard.length === 0 ? (
                <div className="bg-primary border border-border rounded-lg p-12 text-center">
                    <Trophy size={40} className="mx-auto text-muted mb-4" />
                    <h2 className="text-2xl font-tungsten text-white mb-2">No predictions yet</h2>
                    <p className="text-muted text-sm">Be the first to predict and claim the top spot.</p>
                </div>
            ) : (
                <div className="bg-primary border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-secondary text-muted text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium w-16">Rank</th>
                                <th className="px-6 py-4 font-medium">Username</th>
                                <th className="px-6 py-4 font-medium">Accuracy</th>
                                <th className="px-6 py-4 font-medium text-right">Correct / Resolved</th>
                                <th className="px-6 py-4 font-medium text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {leaderboard.map(entry => {
                                const isYou = userId === entry.id;
                                return (
                                    <tr key={entry.id}
                                        className={`hover:bg-secondary transition-colors ${isYou ? 'bg-accent/10 border-l-2 border-l-accent' : ''}`}>
                                        <td className="px-6 py-4 font-tungsten text-xl text-muted">#{entry.rank}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 font-bold text-white">
                                                <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs">
                                                    {entry.username.slice(0, 2).toUpperCase()}
                                                </div>
                                                {entry.username}
                                                {isYou && (
                                                    <span className="text-xs bg-accent text-white px-2 py-0.5 rounded">YOU</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
                                                    <div className="h-full bg-bull rounded-full" style={{ width: `${entry.accuracy}%` }} />
                                                </div>
                                                <span className="text-xs text-muted">{entry.accuracy}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted text-right">
                                            {entry.correct} / {entry.resolved}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white text-right">
                                            {entry.totalScore.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
