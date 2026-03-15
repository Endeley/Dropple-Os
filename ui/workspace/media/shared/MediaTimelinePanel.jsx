'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
    projectMediaPlaybackState,
    projectMediaTimelineTracks,
    selectMediaCursorIndex,
    selectMediaPlayback,
    selectMediaTimeline,
} from '@/runtime/projection/selectors/mediaSelectors.js';
import {
    timelineIntentClockPause,
    timelineIntentClockSeek,
} from '@/ui/timeline/timelineIntent.js';

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
    const playbackState = useRuntimeStore(selectMediaPlayback);
    const cursorIndex = useRuntimeStore(selectMediaCursorIndex);
    const tracks = useMemo(() => projectMediaTimelineTracks(timeline), [timeline]);
    const playback = useMemo(
        () => projectMediaPlaybackState({ playback: playbackState, cursorIndex, timeline }),
        [playbackState, cursorIndex, timeline]
    );
    const duration = Math.max(1, playback.duration || 1);
    const currentFrame = Math.max(0, Math.min(duration, playback.time || 0));
    const [isScrubbing, setIsScrubbing] = useState(false);

    function seekTo(frame) {
        const nextFrame = Math.max(0, Math.min(duration, Math.round(frame)));
        timelineIntentClockSeek({ time: nextFrame });
    }

    function seekFromClientX(clientX) {
        const rail = document.getElementById('media-workspace-timeline-rail');
        if (!rail) return;
        const bounds = rail.getBoundingClientRect();
        if (bounds.width <= 0) return;
        const progress = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
        seekTo(progress * duration);
    }

    useEffect(() => {
        if (!isScrubbing) return undefined;

        function handlePointerMove(event) {
            seekFromClientX(event.clientX);
        }

        function handlePointerUp() {
            setIsScrubbing(false);
        }

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isScrubbing, duration]);

    const visibleTracks = tracks.length
        ? tracks
        : mode.trackTypes.map((trackType) => ({ id: trackType, property: trackType, keyframes: [] }));

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
                    {visibleTracks.length} timeline tracks
                </div>
            </div>
            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                        Playhead: frame {currentFrame} / {duration}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                        {playback.playing ? 'Live playback' : 'Scrub preview'}
                    </div>
                </div>
                <div
                    id='media-workspace-timeline-rail'
                    role='slider'
                    aria-label='Media timeline playhead'
                    aria-valuemin={0}
                    aria-valuemax={duration}
                    aria-valuenow={currentFrame}
                    onPointerDown={(event) => {
                        timelineIntentClockPause();
                        setIsScrubbing(true);
                        seekFromClientX(event.clientX);
                    }}
                    style={{
                        position: 'relative',
                        height: 34,
                        borderRadius: 12,
                        border: '1px solid rgba(148, 163, 184, 0.35)',
                        background:
                            'linear-gradient(90deg, rgba(226,232,240,0.9) 0%, rgba(241,245,249,0.95) 100%)',
                        overflow: 'hidden',
                        cursor: 'ew-resize',
                    }}>
                    <div
                        style={{
                            position: 'absolute',
                            inset: '0 auto 0 0',
                            width: `${(currentFrame / duration) * 100}%`,
                            background: 'rgba(14, 116, 144, 0.18)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            left: `calc(${(currentFrame / duration) * 100}% - 1px)`,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            background: '#0f172a',
                            boxShadow: '0 0 0 1px rgba(255,255,255,0.55)',
                        }}
                    />
                </div>
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                {visibleTracks.map((track) => (
                    <div
                        key={track.id}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '140px minmax(0, 1fr) auto',
                            alignItems: 'center',
                            gap: 12,
                            borderRadius: 10,
                            background: '#e2e8f0',
                            padding: '8px 10px',
                            fontSize: 12,
                            color: '#334155',
                        }}>
                        <span style={{ fontWeight: 600 }}>{track.property || track.id}</span>
                        <div
                            style={{
                                position: 'relative',
                                height: 18,
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.6)',
                                overflow: 'hidden',
                            }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `calc(${(currentFrame / duration) * 100}% - 1px)`,
                                    top: 0,
                                    bottom: 0,
                                    width: 2,
                                    background: '#0f172a',
                                    opacity: 0.45,
                                }}
                            />
                            {track.keyframes.map((keyframe) => {
                                const keyframeTime = Number(keyframe?.time ?? 0);
                                return (
                                    <button
                                        key={keyframe.id ?? `${track.id}-${keyframeTime}`}
                                        type='button'
                                        onClick={() => {
                                            timelineIntentClockPause();
                                            seekTo(keyframeTime);
                                        }}
                                        title={`Jump to frame ${keyframeTime}`}
                                        style={{
                                            position: 'absolute',
                                            left: `calc(${(Math.max(0, Math.min(duration, keyframeTime)) / duration) * 100}% - 5px)`,
                                            top: 4,
                                            width: 10,
                                            height: 10,
                                            borderRadius: 999,
                                            border: '1px solid rgba(15, 23, 42, 0.2)',
                                            background: '#0ea5e9',
                                            padding: 0,
                                            cursor: 'pointer',
                                        }}
                                    />
                                );
                            })}
                        </div>
                        <span style={{ color: '#64748b' }}>{track.keyframes.length} keyframes</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
