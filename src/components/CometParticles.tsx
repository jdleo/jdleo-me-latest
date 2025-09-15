'use client';

import { useEffect, useState, useCallback } from 'react';

interface CometData {
    id: number;
    x: number;
    y: number;
    createdAt: number;
}

export function CometParticles() {
    const [comets, setComets] = useState<CometData[]>([]);

    const createComet = useCallback(() => {
        const newComet: CometData = {
            id: Date.now() + Math.random(),
            x: Math.round(Math.random() * window.innerWidth),
            y: Math.round(Math.random() * window.innerHeight),
            createdAt: Date.now(),
        };

        setComets(prevComets => {
            // Remove comets older than 4 seconds and limit to 50 comets
            const now = Date.now();
            let filteredComets = prevComets.filter(comet => now - comet.createdAt < 4000);

            if (filteredComets.length >= 50) {
                filteredComets = filteredComets.slice(-49);
            }

            return [...filteredComets, newComet];
        });
    }, []);

    useEffect(() => {
        // Create initial comets
        const initialInterval = setInterval(createComet, 200);
        setTimeout(() => clearInterval(initialInterval), 2000);

        // Then create comets at regular intervals
        const regularInterval = setInterval(createComet, 800);

        return () => {
            clearInterval(regularInterval);
        };
    }, [createComet]);

    return (
        <div className='comets-container'>
            {comets.map(comet => (
                <div
                    key={comet.id}
                    className='comet'
                    style={{
                        left: `${comet.x}px`,
                        top: `${comet.y}px`,
                    }}
                />
            ))}
        </div>
    );
}
