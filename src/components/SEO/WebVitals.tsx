'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
    useReportWebVitals(metric => {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Web Vital:', metric);
        }

        // Send to analytics service (Vercel Analytics, Google Analytics, etc.)
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', metric.name, {
                event_category: 'Web Vitals',
                event_label: metric.id,
                value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                non_interaction: true,
            });
        }

        // Send to Vercel Analytics if available
        if (typeof window !== 'undefined' && window.va) {
            window.va('track', 'Web Vital', {
                name: metric.name,
                value: metric.value,
                delta: metric.delta,
                id: metric.id,
            });
        }
    });

    return null;
}

// Type declarations for global objects
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        va?: (...args: any[]) => void;
    }
}
