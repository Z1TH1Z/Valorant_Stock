'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const mockData = [
    { week: 'Week 1', SEN: 100, FNC: 105, PRX: 98, TH: 102, LOUD: 95 },
    { week: 'Week 2', SEN: 110, FNC: 102, PRX: 104, TH: 99, LOUD: 90 },
    { week: 'Week 3', SEN: 115, FNC: 110, PRX: 108, TH: 95, LOUD: 85 },
    { week: 'Week 4', SEN: 125, FNC: 115, PRX: 100, TH: 90, LOUD: 80 },
    { week: 'Week 5', SEN: 130, FNC: 118, PRX: 110, TH: 85, LOUD: 75 },
];

export function StockChart() {
    return (
        <div className="w-full h-full p-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                        tickFormatter={(value) => `${value} pts`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0F1923', borderColor: '#1f2937', color: '#ECE8E1' }}
                        itemStyle={{ color: '#ECE8E1' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="SEN" stroke="#FF4655" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="FNC" stroke="#00FF9D" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="PRX" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="TH" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="LOUD" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
