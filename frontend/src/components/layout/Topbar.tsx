import { Search, Bell } from 'lucide-react';
import { RefreshButton } from './RefreshButton';

export function Topbar() {
    return (
        <header className="h-16 border-b border-border bg-primary flex items-center justify-between px-8 relative">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search teams, players or matches..."
                    className="w-full bg-secondary text-white text-sm rounded-lg py-2.5 pl-10 pr-4 outline-none border border-border focus:border-accent/50 transition-all placeholder:text-muted"
                    suppressHydrationWarning
                />
            </div>

            <div className="flex items-center space-x-6">
                <RefreshButton />
                <button className="relative text-muted hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5">
                    <Bell size={22} />
                </button>
            </div>

            {/* Accent bottom glow line */}
            <div className="absolute bottom-0 left-0 right-0 glow-line" />
        </header>
    );
}
