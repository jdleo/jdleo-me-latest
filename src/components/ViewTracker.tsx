'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
    slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
    useEffect(() => {
        // Increment view count asynchronously when component mounts (page loads)
        const incrementView = async () => {
            try {
                await fetch('/api/blog-views', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ slug }),
                });
            } catch (error) {
                // Silently fail - don't log errors for view tracking
                console.error('Error incrementing view count:', error);
            }
        };

        // Only increment if this is a real page load (not during SSR/hydration)
        if (typeof window !== 'undefined') {
            // Small delay to avoid interfering with initial page load
            const timer = setTimeout(incrementView, 100);
            return () => clearTimeout(timer);
        }
    }, [slug]);

    // This component doesn't render anything
    return null;
}
