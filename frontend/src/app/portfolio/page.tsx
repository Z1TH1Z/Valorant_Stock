'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Minus, Wallet, ShoppingBag } from 'lucide-react';
import { STOCK_START } from '@/lib/stockFormula';

interface Holding {
  id: string;
  teamName: string;
  shares: number;
  buyPrice: number;
  createdAt: string;
}

interface TeamPrice {
  [team: string]: number;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [coins, setCoins] = useState(1000);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [prices, setPrices] = useState<TeamPrice>({});
  const [loading, setLoading] = useState(true);
  const [selling, setSelling] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portfolio')
      .then(r => r.json())
      .then(async d => {
        if (d.error) { router.push('/'); return; }
        setCoins(d.coins ?? 1000);
        const h: Holding[] = d.holdings ?? [];
        setHoldings(h);

        const priceMap: TeamPrice = {};
        await Promise.all(
          h.map(async ({ teamName }) => {
            try {
              const res = await fetch(`/api/chart/team/${encodeURIComponent(teamName)}`);
              const data = await res.json();
              priceMap[teamName] = data.current ?? STOCK_START;
            } catch {
              priceMap[teamName] = STOCK_START;
            }
          })
        );
        setPrices(priceMap);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function sell(teamName: string) {
    const currentPrice = prices[teamName] ?? STOCK_START;
    setSelling(teamName);
    try {
      const res = await fetch('/api/portfolio/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, currentPrice }),
      });
      const data = await res.json();
      if (res.ok) {
        setHoldings(prev => prev.filter(h => h.teamName !== teamName));
        setCoins(prev => prev + data.saleValue);
      }
    } finally {
      setSelling(null);
    }
  }

  const totalInvested = holdings.reduce((s, h) => s + h.shares * h.buyPrice, 0);
  const totalValue = holdings.reduce((s, h) => s + h.shares * (prices[h.teamName] ?? h.buyPrice), 0);
  const totalPnl = totalValue - totalInvested;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted text-sm uppercase tracking-widest mb-1">My Portfolio</p>
          <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">Investment Portfolio</h1>
        </div>
        <div className="flex gap-4">
          <div className="text-right bg-primary border border-border rounded-lg px-5 py-3">
            <div className="text-muted text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-end">
              <Wallet size={12} /> Available
            </div>
            <div className="text-2xl font-tungsten text-white">{coins.toLocaleString()} <span className="text-muted text-sm">coins</span></div>
          </div>
          <div className="text-right bg-primary border border-border rounded-lg px-5 py-3">
            <div className="text-muted text-xs uppercase tracking-wider mb-1">Portfolio Value</div>
            <div className="text-2xl font-tungsten text-white">{Math.round(totalValue).toLocaleString()} <span className="text-muted text-sm">coins</span></div>
            <div className={`text-xs font-bold flex items-center justify-end gap-1 ${totalPnl > 0 ? 'text-bull' : totalPnl < 0 ? 'text-bear' : 'text-muted'}`}>
              {totalPnl > 0 ? <TrendingUp size={10} /> : totalPnl < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
              {totalPnl > 0 ? '+' : ''}{Math.round(totalPnl)} coins
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Active Holdings</h2>
          <span className="text-muted text-xs">{holdings.length} position{holdings.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-surface rounded animate-pulse" />)}</div>
        ) : holdings.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag size={40} className="text-muted mx-auto mb-3 opacity-40" />
            <p className="text-muted text-sm">No holdings yet.</p>
            <p className="text-muted text-xs mt-1">Search for a team and click <span className="text-white">Buy</span> to invest.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[11px] text-muted border-b border-border">
                <th className="text-left px-6 py-3 font-medium">Team</th>
                <th className="text-right px-4 py-3 font-medium">Buy Price</th>
                <th className="text-right px-4 py-3 font-medium">Current</th>
                <th className="text-right px-4 py-3 font-medium">Invested</th>
                <th className="text-right px-4 py-3 font-medium">Value</th>
                <th className="text-right px-4 py-3 font-medium">P&amp;L</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const cur = prices[h.teamName] ?? h.buyPrice;
                const invested = Math.round(h.shares * h.buyPrice);
                const value = Math.round(h.shares * cur);
                const pnl = value - invested;
                const pct = ((pnl / invested) * 100).toFixed(1);
                return (
                  <tr key={h.id} className="border-b border-border/40 hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/team/${encodeURIComponent(h.teamName)}`)}
                        className="text-white font-bold text-sm hover:text-accent transition-colors text-left"
                      >
                        {h.teamName}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right text-muted text-sm font-tungsten text-lg">{Math.round(h.buyPrice)}</td>
                    <td className="px-4 py-4 text-right text-white text-sm font-tungsten text-lg">{Math.round(cur)}</td>
                    <td className="px-4 py-4 text-right text-muted text-sm">{invested.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-white text-sm font-bold">{value.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`text-sm font-bold ${pnl > 0 ? 'text-bull' : pnl < 0 ? 'text-bear' : 'text-muted'}`}>
                        {pnl > 0 ? '+' : ''}{pnl} <span className="text-xs font-normal opacity-70">({pnl > 0 ? '+' : ''}{pct}%)</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => sell(h.teamName)}
                        disabled={selling === h.teamName}
                        className="text-xs font-bold px-3 py-1.5 rounded bg-bear/20 text-bear hover:bg-bear/30 transition-colors disabled:opacity-50"
                      >
                        {selling === h.teamName ? 'Selling...' : 'Sell'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-primary border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">How it works</h3>
        <p className="text-muted text-sm leading-relaxed">
          Each user starts with <span className="text-white font-bold">1,000 VCTrade coins</span>. Invest in teams at their current stock price — if the team performs well and their price rises, your holding gains value. Sell anytime to lock in profits (or cut losses). Your total wealth = available coins + portfolio value.
        </p>
      </div>
    </div>
  );
}
