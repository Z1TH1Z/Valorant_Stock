'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Zap, Shield, AlertTriangle } from 'lucide-react';
import { STOCK_START } from '@/lib/stockFormula';

interface Match {
  date: string;
  opponent: string;
  myScore: number;
  oppScore: number;
  won: boolean;
  tournament: string;
}

function getVolatility(matches: Match[]) {
  if (matches.length < 3) return { label: 'Unrated', color: 'text-muted', icon: <Minus size={12} />, description: 'Not enough data' };
  const winRate = matches.filter(m => m.won).length / matches.length;
  if (winRate >= 0.65) return { label: 'Stable', color: 'text-bull', icon: <Shield size={12} />, description: 'Consistently winning' };
  if (winRate <= 0.35) return { label: 'High Risk', color: 'text-bear', icon: <AlertTriangle size={12} />, description: 'Low win rate' };
  return { label: 'Volatile', color: 'text-yellow-400', icon: <Zap size={12} />, description: 'Unpredictable results' };
}

export default function TeamPage() {
  const { teamName } = useParams<{ teamName: string }>();
  const name = decodeURIComponent(teamName);
  const router = useRouter();

  const [chartData, setChartData] = useState<any[]>([]);
  const [current, setCurrent]     = useState(STOCK_START);
  const [matches, setMatches]     = useState<Match[]>([]);
  const [loading, setLoading]     = useState(true);

  const [coins, setCoins]         = useState<number | null>(null);
  const [holding, setHolding]     = useState<{ shares: number; buyPrice: number } | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [buying, setBuying]       = useState(false);
  const [selling, setSelling]     = useState(false);
  const [buyMsg, setBuyMsg]       = useState('');

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

    fetch('/api/portfolio')
      .then(r => r.json())
      .then(d => {
        if (d.error) return;
        setCoins(d.coins ?? 1000);
        const h = (d.holdings ?? []).find((x: any) => x.teamName === name);
        if (h) setHolding({ shares: h.shares, buyPrice: h.buyPrice });
      })
      .catch(() => {});
  }, [name]);

  async function buy() {
    const amount = Number(investAmount);
    if (!amount || amount <= 0) return;
    setBuying(true);
    setBuyMsg('');
    try {
      const res = await fetch('/api/portfolio/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: name, coinsToInvest: amount, currentPrice: current }),
      });
      const data = await res.json();
      if (!res.ok) { setBuyMsg(data.error ?? 'Error'); return; }
      setCoins(data.coinsRemaining);
      setHolding(prev => {
        const prevShares = prev?.shares ?? 0;
        const newShares = prevShares + amount / current;
        return { shares: newShares, buyPrice: current };
      });
      setInvestAmount('');
      setBuyMsg('Invested!');
      setTimeout(() => setBuyMsg(''), 2000);
    } finally {
      setBuying(false);
    }
  }

  async function sell() {
    setSelling(true);
    try {
      const res = await fetch('/api/portfolio/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: name, currentPrice: current }),
      });
      const data = await res.json();
      if (!res.ok) { setBuyMsg(data.error ?? 'Error'); return; }
      setCoins(prev => (prev ?? 0) + data.saleValue);
      setHolding(null);
      setBuyMsg(`Sold for ${data.saleValue} coins (${data.pnl >= 0 ? '+' : ''}${data.pnl} P&L)`);
      setTimeout(() => setBuyMsg(''), 3000);
    } finally {
      setSelling(false);
    }
  }

  const change     = current - STOCK_START;
  const changePct  = ((change / STOCK_START) * 100).toFixed(1);
  const isUp       = change > 0;
  const isDown     = change < 0;
  const volatility = getVolatility(matches);
  const holdingValue = holding ? Math.round(holding.shares * current) : 0;
  const holdingPnl   = holding ? holdingValue - Math.round(holding.shares * holding.buyPrice) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted text-sm uppercase tracking-widest mb-1">Team Stock</p>
          <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">{name}</h1>
          <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-bold border ${
            volatility.label === 'Stable'    ? 'bg-bull/10 border-bull/30 text-bull' :
            volatility.label === 'High Risk' ? 'bg-bear/10 border-bear/30 text-bear' :
            volatility.label === 'Volatile'  ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' :
            'bg-white/5 border-border text-muted'
          }`}>
            {volatility.icon}
            {volatility.label}
            <span className="opacity-60 font-normal ml-1">— {volatility.description}</span>
          </div>
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
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
                <ReferenceLine y={STOCK_START} stroke="#374151" strokeDasharray="4 4" label={{ value: 'Start', fill: '#6b7280', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F1923', borderColor: '#1f2937', color: '#ECE8E1', borderRadius: '8px' }}
                  formatter={(val: any) => [`${val} pts`, name]}
                />
                <Line type="monotone" dataKey="price" stroke={isDown ? '#FF4655' : '#00FF9D'}
                  strokeWidth={3} dot={{ r: 4, fill: isDown ? '#FF4655' : '#00FF9D' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center">
            <p className="text-muted text-sm">No match data available for this season.</p>
          </div>
        )}
      </div>

      {/* Invest Panel — only shown when signed in */}
      {coins !== null && (
        <div className="bg-primary border border-border rounded-lg p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Invest in {name}</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Available coins</span>
                <span className="text-white font-bold">{coins.toLocaleString()}</span>
              </div>
              {holding && (
                <div className="bg-surface rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>Your holding</span><span className="text-white font-bold">{holdingValue} coins</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>P&amp;L</span>
                    <span className={holdingPnl >= 0 ? 'text-bull font-bold' : 'text-bear font-bold'}>
                      {holdingPnl >= 0 ? '+' : ''}{holdingPnl} coins
                    </span>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={coins}
                  value={investAmount}
                  onChange={e => setInvestAmount(e.target.value)}
                  placeholder="Coins to invest"
                  className="flex-1 bg-secondary text-white text-sm rounded-lg py-2.5 px-3 outline-none border border-border focus:border-accent/50 transition-all placeholder:text-muted"
                />
                <button
                  onClick={buy}
                  disabled={buying || !investAmount || Number(investAmount) > coins || Number(investAmount) <= 0}
                  className="px-5 py-2.5 rounded-lg bg-bull/20 text-bull font-bold text-sm hover:bg-bull/30 transition-colors disabled:opacity-40"
                >
                  {buying ? 'Buying...' : 'Buy'}
                </button>
                {holding && (
                  <button
                    onClick={sell}
                    disabled={selling}
                    className="px-5 py-2.5 rounded-lg bg-bear/20 text-bear font-bold text-sm hover:bg-bear/30 transition-colors disabled:opacity-40"
                  >
                    {selling ? '...' : 'Sell All'}
                  </button>
                )}
              </div>
              {buyMsg && (
                <p className={`text-xs font-medium ${buyMsg.includes('Error') || buyMsg.includes('Insufficient') ? 'text-bear' : 'text-bull'}`}>
                  {buyMsg}
                </p>
              )}
            </div>
            <div className="sm:w-44 bg-surface rounded-lg p-4 text-center">
              <div className="text-muted text-xs uppercase tracking-wider mb-1">Stock Price</div>
              <div className="text-3xl font-tungsten text-white">{current}</div>
              <div className={`text-xs font-bold mt-1 ${isUp ? 'text-bull' : isDown ? 'text-bear' : 'text-muted'}`}>
                {isUp ? '+' : ''}{change} pts this season
              </div>
            </div>
          </div>
        </div>
      )}

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
