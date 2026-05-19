'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, TrendingUp, Trophy, LogIn, LogOut } from 'lucide-react';

const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/predictions', icon: TrendingUp, label: 'Predictions' },
    { href: '/leaderboards', icon: Trophy, label: 'Leaderboards' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

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
                                }`}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="px-6 py-3 border-t border-border">
                <p className="text-[10px] text-muted/50 uppercase tracking-widest mb-2">Credits</p>
                <div className="space-y-1">
                    <a href="https://liquipedia.net/valorant" target="_blank" rel="noopener noreferrer"
                        className="block text-[11px] text-muted hover:text-white transition-colors">
                        Liquipedia
                    </a>
                    <a href="https://vlr.gg" target="_blank" rel="noopener noreferrer"
                        className="block text-[11px] text-muted hover:text-white transition-colors">
                        VLR.gg
                    </a>
                </div>
            </div>

            <div className="p-6 border-t border-border">
                {session?.user ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                                {(session.user.name ?? '?').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm text-white truncate">{session.user.name}</p>
                                <p className="text-xs text-muted truncate">{session.user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut()}
                            title="Sign out"
                            className="ml-2 text-muted hover:text-white transition-colors flex-shrink-0"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/auth/signin"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted hover:text-white hover:bg-surface transition-all"
                    >
                        <LogIn size={20} />
                        <span>Sign In</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}
