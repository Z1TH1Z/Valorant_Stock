'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RefreshButton() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh(); // Triggers a re-fetch of Server Components

        // Reset the animation state after a short delay
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    return (
        <button
            onClick={handleRefresh}
            className="relative text-muted hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5"
            aria-label="Refresh data"
            title="Refresh data"
        >
            <RefreshCw
                size={22}
                className={isRefreshing ? 'animate-spin text-accent' : ''}
            />
        </button>
    );
}
