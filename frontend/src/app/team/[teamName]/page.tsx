'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { STOCK_START } from '@/lib/stockFormula';

export default function TeamPage() {
  const { teamName } = useParams<{ teamName: string }>();
  const name = decodeURIComponent(teamName);

  const [chartData, setChartData]   = useState<any[]>([]);
  const [current, setCurrent]       = useState(STOCK_START);
  const [matches, setMatches]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch(`/api/chart/team/${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(d => {
        setChartData(d.chartData ?? []);
        setCurrent(d.current ?? STOCK_START);
        setMatches(d.matches ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [name]);

  const change    = current - STOCK_START;
  const changePct = ((change / STOCK_START) * 100).toFixed(1);
  const isUp      = change > 0;
  const isDown    = change < 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted text-sm uppercase tracking-widest mb-1">Team Stock</p>
          <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">{name}</h1>
        </div>
        <div className="text-right">
          <div className="text-4xl font-tungsten text-white">{current} <span className="text-muted text-xl">pts</span></div>
          <div className={`flex items-center justify-end gap-1 text-sm font-bold ${isUp ? 'text-bull' : isDown ? 'text-bear' : 'text-muted'}`}>
            {isUp ? <TrendingUp size={16} /> : isDown ? <TrendingDown size={16} /> : <Minus size={16} />}
            {isUp ? '+' : ''}{change} pts ({isUp ? '+' : ''}{changePct}%) from season start
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-primary border border-border rounded-lg p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-6">Performance Index — 2026 Season</h2>
        {loading ? (
          <div className="h-72 bg-surface rounded animate-pulse" />
        ) : chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="week" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}`} />
                <ReferenceLine y={STOCK_START} stroke="#374151" strokeDasharray="4 4" label={{ value: 'Start', fill: '#6b7280', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F1923', borderColor: '#1f2937', color: '#ECE8E1', borderRadius: '8px' }}
                  formatter={(val: any) => [`${val} pts`, name]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isDown ? '#FF4655' : '#00FF9D'}
                  strokeWidth={3}
                  dot={{ r: 4, fill: isDown ? '#FF4655' : '#00FF9D' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center">
            <p className="text-muted text-sm">No match data available for this season.</p>
          </div>
        )}
      </div>

      {/* Recent Matches */}
      <div className="bg-primary border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Recent Results</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-surface rounded animate-pulse" />)}</div>
        ) : matches.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-[11px] text-muted border-b border-border">
                <th className="text-left px-6 py-3 font-medium">Result</th>
                <th className="text-left px-4 py-3 font-medium">Opponent</th>
                <th className="text-center px-4 py-3 font-medium">Score</th>
                <th className="text-left px-4 py-3 font-medium">Tournament</th>
                <th className="text-right px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${m.won ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'}`}>
                      {m.won ? 'WIN' : 'LOSS'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white text-sm font-medium">{m.opponent}</td>
                  <td className="px-4 py-3 text-center font-tungsten text-lg text-white">{m.myScore} – {m.oppScore}</td>
                  <td className="px-4 py-3 text-muted text-xs truncate max-w-[200px]">{m.tournament}</td>
                  <td className="px-6 py-3 text-right text-muted text-xs">
                    {m.date ? new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-muted text-sm">No results this season.</p>
        )}
      </div>
    </div>
  );
}
