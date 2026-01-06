'use client';

// branching/merge/VisualNodeDiffOverlay.jsx

import React from 'react';

/**
 * Visual before/after overlay for node diffs.
 *
 * 🔒 Read-only
 */
export default function VisualNodeDiffOverlay({ diffs }) {
    if (!Array.isArray(diffs) || diffs.length === 0) return null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 25,
            }}
        >
            {diffs.map((d) => (
                <React.Fragment key={d.id}>
                    {/* BEFORE */}
                    <div
                        style={{
                            position: 'absolute',
                            left: d.before.x,
                            top: d.before.y,
                            width: d.before.width,
                            height: d.before.height,
                            border: '1px dashed rgba(239,68,68,0.9)',
                            background: 'rgba(239,68,68,0.1)',
                        }}
                    />

                    {/* AFTER */}
                    <div
                        style={{
                            position: 'absolute',
                            left: d.after.x,
                            top: d.after.y,
                            width: d.after.width,
                            height: d.after.height,
                            border: '1px solid rgba(34,197,94,0.9)',
                            background: 'rgba(34,197,94,0.12)',
                        }}
                    />
                </React.Fragment>
            ))}
        </div>
    );
}
