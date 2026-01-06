'use client';

// perf/PerfHUD.jsx

import React, { useEffect, useState } from 'react';
import { getPerfStats } from './perfTracker';

export default function PerfHUD() {
    const [stats, setStats] = useState({});

    useEffect(() => {
        const id = setInterval(() => {
            setStats(getPerfStats());
        }, 1000);

        return () => clearInterval(id);
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 8,
                right: 8,
                background: 'rgba(0,0,0,0.75)',
                color: '#0f0',
                fontSize: 11,
                padding: 6,
                borderRadius: 4,
                zIndex: 9999,
                maxWidth: 260,
            }}
        >
            <div style={{ marginBottom: 4, opacity: 0.7 }}>Perf Stats (avg / max ms)</div>

            {Object.entries(stats).map(([k, v]) => (
                <div key={k}>
                    {k}: {v.avg.toFixed(2)} / {v.max.toFixed(2)}
                </div>
            ))}
        </div>
    );
}
