// timeline/markers/MarkerControls.jsx

import React, { useState } from 'react';
import { useTimelineMarkers } from './useTimelineMarkers';

/**
 * Timeline Marker Controls UI.
 *
 * 🔒 Rules:
 * - UI-only
 * - No reducers
 * - No persistence
 */
export default function MarkerControls({ currentTime, onSeek }) {
    if (typeof currentTime !== 'number') {
        throw new Error('MarkerControls: currentTime is required');
    }
    if (typeof onSeek !== 'function') {
        throw new Error('MarkerControls: onSeek callback is required');
    }

    const { inPoint, outPoint, markers, setInPoint, setOutPoint, clearInOut, addMarker, removeMarker } =
        useTimelineMarkers();

    const [label, setLabel] = useState('');

    const handleAddMarker = () => {
        if (!label.trim()) return;

        addMarker({
            id: `marker:${Date.now()}`, // UI-only ID (safe)
            time: currentTime,
            label: label.trim(),
        });
        setLabel('');
    };

    return (
        <div
            style={{
                padding: 8,
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.4)',
                color: '#fff',
                fontSize: 12,
            }}
        >
            {/* In / Out */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <button style={btn} onClick={() => setInPoint(currentTime)}>
                    Set In
                </button>
                <button style={btn} onClick={() => setOutPoint(currentTime)}>
                    Set Out
                </button>
                <button style={btn} onClick={clearInOut}>
                    Clear
                </button>
                <div style={{ opacity: 0.7 }}>
                    In: {inPoint ?? '—'} | Out: {outPoint ?? '—'}
                </div>
            </div>

            {/* Add Marker */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Marker name"
                    style={input}
                />
                <button style={btn} onClick={handleAddMarker}>
                    Add
                </button>
            </div>

            {/* Marker List */}
            <div>
                {markers.length === 0 && <div style={{ opacity: 0.5 }}>No markers</div>}
                {markers.map((m) => (
                    <div
                        key={m.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '2px 0',
                        }}
                    >
                        <span style={{ cursor: 'pointer' }} onClick={() => onSeek(m.time)}>
                            ● {m.label} @ {Math.round(m.time)}ms
                        </span>
                        <button style={iconBtn} onClick={() => removeMarker(m.id)} title="Remove marker">
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

const btn = {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 4,
    padding: '2px 6px',
    cursor: 'pointer',
};

const iconBtn = {
    ...btn,
    padding: '0 4px',
};

const input = {
    flex: 1,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 4,
    padding: '2px 6px',
};
