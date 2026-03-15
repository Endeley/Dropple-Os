'use client';

import { useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
    projectMediaTimelineTracks,
    selectMediaTimeline,
} from '@/runtime/projection/selectors/mediaSelectors.js';

function cardStyle() {
    return {
        borderRadius: 14,
        border: '1px solid rgba(148, 163, 184, 0.35)',
        background: 'rgba(248, 250, 252, 0.94)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 14px 34px rgba(15, 23, 42, 0.12)',
        padding: '12px 14px',
    };
}

export function MediaTimelinePanel({ mode }) {
    const timeline = useRuntimeStore(selectMediaTimeline);
    const tracks = useMemo(() => projectMediaTimelineTracks(timeline), [timeline]);

    return (
        <div style={cardStyle()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                        Timeline
                    </div>
                    <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>
                        Shared timeline surface with mode-specific track schema
                    </div>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                    {tracks.length} timeline tracks
                </div>
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                {(tracks.length ? tracks : mode.trackTypes.map((trackType) => ({ id: trackType, property: trackType, keyframes: [] }))).map((track) => (
                    <div
                        key={track.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            borderRadius: 10,
                            background: '#e2e8f0',
                            padding: '8px 10px',
                            fontSize: 12,
                            color: '#334155',
                        }}>
                        <span style={{ fontWeight: 600 }}>{track.property || track.id}</span>
                        <span style={{ color: '#64748b' }}>{track.keyframes.length} keyframes</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
