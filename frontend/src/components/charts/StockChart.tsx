'use client';

import { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API_BASE = '';

// Fixed palette — assigned to teams in win-rank order
const TEAM_COLORS = ['#FF4655', '#00FF9D', '#3b82f6', '#eab308', '#a855f7'];

export function StockChart() {
    const [isMounted, setIsMounted] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);
    const [teams, setTeams] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        fetch(`${API_BASE}/api/chart/season`)
            .then(r => r.json())
            .then(d => {
                setChartData(d.chartData ?? []);
                setTeams(d.teams ?? []);
            })
            .catch(() => { /* leave empty — fallback shown below */ })
            .finally(() => setLoading(false));
    }, []);

    if (!isMounted) {
        return (
            <div className="w-full h-full p-2">
                <div className="w-full h-full rounded-md bg-secondary/30" />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full h-full p-2 flex items-center justify-center">
                <div className="text-muted text-sm animate-pulse">Loading season data…</div>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="w-full h-full p-2 flex items-center justify-center">
                <div className="text-muted text-sm">No season data available yet.</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis
                        dataKey="week"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        domain={['auto', 'auto']}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v} pts`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0F1923', borderColor: '#1f2937', color: '#ECE8E1' }}
                        itemStyle={{ color: '#ECE8E1' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {teams.map((team, i) => (
                        <Line
                            key={team}
                            type="monotone"
                            dataKey={team}
                            stroke={TEAM_COLORS[i % TEAM_COLORS.length]}
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
