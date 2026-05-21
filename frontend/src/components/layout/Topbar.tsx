'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RefreshButton } from './RefreshButton';
import { FRANCHISE_TEAMS } from '@/lib/stockFormula';

const REGION_COLORS: Record<string, string> = {
  americas: 'text-blue-400',
  emea:     'text-green-400',
  pacific:  'text-yellow-400',
  china:    'text-red-400',
};

export function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim().length > 0
    ? FRANCHISE_TEAMS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  function navigate(name: string) {
    setQuery('');
    setOpen(false);
    router.push(`/team/${encodeURIComponent(name)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && filtered.length > 0) navigate(filtered[0].name);
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-primary flex items-center justify-between px-8 relative">
      <div className="relative w-96" ref={ref}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search franchise teams..."
          className="w-full bg-secondary text-white text-sm rounded-lg py-2.5 pl-10 pr-4 outline-none border border-border focus:border-accent/50 transition-all placeholder:text-muted"
        />

        {open && filtered.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-primary border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            {filtered.slice(0, 8).map(team => (
              <button
                key={team.name}
                onClick={() => navigate(team.name)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface transition-colors text-left"
              >
                <span className="text-white text-sm font-medium">{team.name}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold ${REGION_COLORS[team.region]}`}>
                  {team.region}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-6">
        <RefreshButton />
        <button className="relative text-muted hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5">
          <Bell size={22} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 glow-line" />
    </header>
  );
}
