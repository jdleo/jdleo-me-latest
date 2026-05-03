'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function BaseViewTracker() {
    const pathname = usePathname();
    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        if (!pathname || lastTrackedPath.current === pathname) {
            return;
        }

        lastTrackedPath.current = pathname;

        const timer = setTimeout(() => {
            fetch('/api/view', {
                method: 'POST',
                keepalive: true,
            }).catch((error) => {
                console.error('Failed to track base page view:', error);
            });
        }, 100);

        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
}
