'use client';

import { useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
    projectMediaPlaybackState,
    selectMediaCursorIndex,
    selectMediaPlayback,
    selectMediaTimeline,
} from '@/runtime/projection/selectors/mediaSelectors.js';

function cardStyle() {
    return {
        borderRadius: 14,
        border: '1px solid rgba(148, 163, 184, 0.35)',
        background: 'rgba(248, 250, 252, 0.92)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 14px 34px rgba(15, 23, 42, 0.12)',
        padding: '10px 12px',
    };
}

export function MediaTransportBar({ mode }) {
    const playbackState = useRuntimeStore(selectMediaPlayback);
    const cursorIndex = useRuntimeStore(selectMediaCursorIndex);
    const timeline = useRuntimeStore(selectMediaTimeline);
    const playback = useMemo(
        () => projectMediaPlaybackState({ playback: playbackState, cursorIndex, timeline }),
        [playbackState, cursorIndex, timeline]
    );

    return (
        <div style={cardStyle()}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                        Transport
                    </div>
                    <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>
                        {mode.label} playback and review
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        {playback.playing ? 'Playing' : 'Paused'} · frame {playback.time} / {playback.duration}
                    </div>
                </div>
                <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                    {['rewind', 'play', 'pause', 'step'].map((control) => (
                        <button
                            key={control}
                            type='button'
                            style={{
                                border: '1px solid #cbd5e1',
                                borderRadius: 999,
                                background: '#fff',
                                padding: '6px 10px',
                                fontSize: 12,
                                color: '#334155',
                            }}>
                            {control}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
