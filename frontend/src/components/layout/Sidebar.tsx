'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Globe, TrendingUp, Trophy } from 'lucide-react';

const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/regions', icon: Globe, label: 'Regions' },
    { href: '/predictions', icon: TrendingUp, label: 'Predictions' },
    { href: '/leaderboards', icon: Trophy, label: 'Leaderboards' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-primary border-r border-border flex flex-col">
            <div className="p-6">
                <h1 className="text-3xl font-tungsten text-accent tracking-widest uppercase">
                    VCT Tracker
                </h1>
                <div className="glow-line mt-3" />
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-accent/10 text-white border-l-2 border-accent'
                                    : 'text-muted hover:text-white hover:bg-surface'
                                }`
                            }
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-border">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                        NT
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-white">Nithin</p>
                        <p className="text-xs text-bull">Rank: Ascendant</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
