// collab/CanvasCursors.jsx

'use client';

import React from 'react';

/**
 * Remote cursor overlay.
 *
 * 🔒 Visual only
 */
export default function CanvasCursors({ cursors }) {
    if (!Array.isArray(cursors)) return null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 50,
            }}
        >
            {cursors.map((c) => {
                if (c.x == null || c.y == null) return null;

                return (
                    <div
                        key={c.userId}
                        style={{
                            position: 'absolute',
                            left: c.x,
                            top: c.y,
                            transform: 'translate(-2px, -2px)',
                            fontSize: 12,
                            color: c.color ?? '#60a5fa',
                        }}
                    >
                        ▲
                        {c.name && (
                            <div
                                style={{
                                    fontSize: 10,
                                    marginTop: 2,
                                    opacity: 0.8,
                                }}
                            >
                                {c.name}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
