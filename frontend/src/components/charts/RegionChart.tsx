'use client';

import { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const API_BASE = '';

const TEAM_COLORS = [
    '#FF4655', '#00FF9D', '#3b82f6', '#eab308',
    '#a855f7', '#f97316', '#06b6d4', '#ec4899',
    '#84cc16', '#ef4444', '#14b8a6',
];

interface RegionChartProps {
    regionName: string;
    region: string;   // slug: americas | emea | pacific | china
}

export function RegionChart({ regionName, region }: RegionChartProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);
    const [teams, setTeams] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        fetch(`${API_BASE}/api/chart/region/${region}`)
            .then(r => r.json())
            .then(d => {
                setChartData(d.chartData ?? []);
                setTeams(d.teams ?? []);
            })
            .catch(() => { /* leave empty — fallback shown below */ })
            .finally(() => setLoading(false));
    }, [region]);

    if (!isMounted || loading) {
        return (
            <div className="bg-primary border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">{regionName} Team Performance</h2>
                <div className="h-[300px] flex items-center justify-center">
                    <div className="h-full w-full rounded-md bg-secondary/30 animate-pulse" />
                </div>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="bg-primary border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">{regionName} Team Performance</h2>
                <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted text-sm">No season data available yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-primary border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">{regionName} Team Performance</h2>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0F1923', borderColor: '#1f2937', color: '#ECE8E1', borderRadius: '8px' }}
                            itemStyle={{ color: '#ECE8E1' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        {teams.map((team, i) => (
                            <Line
                                key={team}
                                type="monotone"
                                dataKey={team}
                                stroke={TEAM_COLORS[i % TEAM_COLORS.length]}
                                strokeWidth={2.5}
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
