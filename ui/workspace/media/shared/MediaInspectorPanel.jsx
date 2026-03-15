'use client';

import { useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
    projectMediaSelection,
    projectMediaTimelineTracks,
    selectMediaSelection,
    selectMediaTimeline,
} from '@/runtime/projection/selectors/mediaSelectors.js';

function cardStyle() {
    return {
        borderRadius: 14,
        border: '1px solid rgba(148, 163, 184, 0.35)',
        background: 'rgba(248, 250, 252, 0.92)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 14px 34px rgba(15, 23, 42, 0.12)',
        padding: '12px 14px',
    };
}

export function MediaInspectorPanel({ mode }) {
    const selectionState = useRuntimeStore(selectMediaSelection);
    const timeline = useRuntimeStore(selectMediaTimeline);
    const selection = useMemo(() => projectMediaSelection(selectionState), [selectionState]);
    const tracks = useMemo(() => projectMediaTimelineTracks(timeline), [timeline]);

    return (
        <div style={cardStyle()}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                Inspector
            </div>
            <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginTop: 4 }}>
                {mode.label} mode policy and active schema
            </div>
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                <div>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Serves
                    </div>
                    <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
                        {mode.serves.join(', ')}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Primary Tools
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                        {mode.tools.map((tool) => (
                            <span
                                key={tool}
                                style={{
                                    borderRadius: 999,
                                    padding: '4px 8px',
                                    background: '#e2e8f0',
                                    color: '#334155',
                                    fontSize: 12,
                                }}>
                                {tool}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Export Formats
                    </div>
                    <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
                        {mode.exportFormats.join(', ')}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Timeline Projection
                    </div>
                    <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
                        {tracks.length} tracks visible
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Selection
                    </div>
                    <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
                        {selection.count} selected
                    </div>
                </div>
            </div>
        </div>
    );
}
