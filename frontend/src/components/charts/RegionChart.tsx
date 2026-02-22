'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Color palette for team lines
const TEAM_COLORS = [
    '#FF4655', '#00FF9D', '#3b82f6', '#eab308', '#a855f7',
    '#f97316', '#06b6d4', '#ec4899', '#84cc16', '#ef4444', '#14b8a6'
];

interface TeamData {
    name: string;
    pts: number;
    record?: string;
}

interface RegionChartProps {
    teams: TeamData[];
    regionName: string;
}

export function RegionChart({ teams, regionName }: RegionChartProps) {
    if (!teams || teams.length === 0) return null;

    const topTeams = teams.slice(0, 6);

    // Generate simulated performance data from team points (since we don't have historical data)
    // Seed it from team names so it's deterministic
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    const chartData = weeks.map((week, weekIdx) => {
        const entry: any = { week };
        topTeams.forEach((team) => {
            const basePts = team.pts || 100;
            // Create a progression trend using the team's name as a seed
            const seed = team.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const variance = Math.sin(seed * (weekIdx + 1) * 0.3) * 15;
            const progression = (weekIdx / 4) * basePts * 0.3;
            entry[team.name] = Math.round(basePts * 0.7 + progression + variance);
        });
        return entry;
    });

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
                        {topTeams.map((team, i) => (
                            <Line
                                key={team.name}
                                type="monotone"
                                dataKey={team.name}
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
