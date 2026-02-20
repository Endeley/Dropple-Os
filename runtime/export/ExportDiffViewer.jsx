'use client';

// export/ExportDiffViewer.jsx

import React from 'react';

export default function ExportDiffViewer({ diff }) {
    if (!Array.isArray(diff)) return null;

    return (
        <pre
            style={{
                fontSize: 11,
                background: '#020617',
                color: '#e5e7eb',
                padding: 12,
                borderRadius: 6,
                maxHeight: 300,
                overflow: 'auto',
            }}
        >
            {diff.map((l, i) => {
                let color = '#9ca3af';
                let prefix = ' ';

                if (l.type === 'add') {
                    color = '#22c55e';
                    prefix = '+';
                }
                if (l.type === 'remove') {
                    color = '#ef4444';
                    prefix = '-';
                }

                return (
                    <div key={i} style={{ color }}>
                        {prefix} {l.value}
                    </div>
                );
            })}
        </pre>
    );
}
