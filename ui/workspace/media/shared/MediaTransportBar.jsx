'use client';

import { useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
    projectMediaPlaybackState,
    selectMediaCursorIndex,
    selectMediaPlayback,
    selectMediaTimeline,
} from '@/runtime/projection/selectors/mediaSelectors.js';
import {
    timelineIntentClockPause,
    timelineIntentClockPlay,
    timelineIntentClockSeek,
} from '@/ui/timeline/timelineIntent.js';

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
    const duration = Math.max(0, playback.duration);
    const currentFrame = Math.max(0, playback.time);

    function seekTo(frame) {
        const nextFrame = Math.max(0, Math.min(duration, Math.round(frame)));
        timelineIntentClockSeek({ time: nextFrame });
    }

    function handlePlayPause() {
        if (playback.playing) {
            timelineIntentClockPause();
            return;
        }
        timelineIntentClockPlay();
    }

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
                        {playback.playing ? 'Playing' : 'Paused'} · frame {currentFrame} / {duration}
                    </div>
                </div>
                <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                    <button
                        type='button'
                        onClick={() => seekTo(0)}
                        style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: 999,
                            background: '#fff',
                            padding: '6px 10px',
                            fontSize: 12,
                            color: '#334155',
                        }}>
                        Rewind
                    </button>
                    <button
                        type='button'
                        onClick={() => seekTo(currentFrame - 1)}
                        style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: 999,
                            background: '#fff',
                            padding: '6px 10px',
                            fontSize: 12,
                            color: '#334155',
                        }}>
                        Prev
                    </button>
                    <button
                        type='button'
                        onClick={handlePlayPause}
                        style={{
                            border: '1px solid #94a3b8',
                            borderRadius: 999,
                            background: '#0f172a',
                            padding: '6px 12px',
                            fontSize: 12,
                            color: '#f8fafc',
                            fontWeight: 700,
                        }}>
                        {playback.playing ? 'Pause' : 'Play'}
                    </button>
                    <button
                        type='button'
                        onClick={() => seekTo(currentFrame + 1)}
                        style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: 999,
                            background: '#fff',
                            padding: '6px 10px',
                            fontSize: 12,
                            color: '#334155',
                        }}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
