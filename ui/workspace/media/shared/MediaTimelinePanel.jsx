'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    projectAnimationTrackGroups,
    projectMediaPlaybackState,
    projectMediaTimelineTracks,
    selectMediaCursorIndex,
    selectMediaPlayback,
    selectMediaTimeline,
    projectRigControllerTimelineTracks,
    selectActiveRig,
    projectSequenceTimelineTracks,
    selectActiveSequence,
    useWorkspaceProjectionState as useRuntimeStore,
} from '@/runtime/projection';
import {
    timelineIntentClockPause,
    timelineIntentClockSeek,
    timelineIntentSequenceClipUpdate,
} from '@/ui/timeline/timelineIntent.js';
import { useMediaTimelineSelectionStore } from './useMediaTimelineSelectionStore.js';

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

function laneTone(modeId) {
    if (modeId === 'video') {
        return {
            active: 'rgba(249, 115, 22, 0.18)',
            border: 'rgba(249, 115, 22, 0.35)',
            accent: '#ea580c',
            marker: '#fb923c',
        };
    }

    if (modeId === 'podcast') {
        return {
            active: 'rgba(20, 184, 166, 0.18)',
            border: 'rgba(20, 184, 166, 0.35)',
            accent: '#0f766e',
            marker: '#14b8a6',
        };
    }

    return {
        active: 'rgba(14, 116, 144, 0.14)',
        border: 'rgba(14, 116, 144, 0.35)',
        accent: '#0f766e',
        marker: '#0ea5e9',
    };
}

function renderModeOverlay({ modeId, track, duration, accent }) {
    const clips = Array.isArray(track?.clips) ? track.clips : [];
    const keyframes = Array.isArray(track.keyframes) ? track.keyframes : [];

    if (track?.kind === 'sequence-track' && clips.length) {
        return clips.map((clip) => {
            const start = Number(clip?.start ?? 0);
            const end = Math.max(start, Number(clip?.end ?? start));
            const left = (Math.max(0, start) / duration) * 100;
            const width = Math.max(2, ((end - start) / duration) * 100);
            return (
                <div
                    key={`seq-${track.id}-${clip.id}`}
                    style={{
                        position: 'absolute',
                        left: `${left}%`,
                        width: `${width}%`,
                        top: 3,
                        height: 12,
                        borderRadius: 6,
                        background: 'rgba(30, 41, 59, 0.12)',
                        border: '1px solid rgba(30, 41, 59, 0.2)',
                    }}
                />
            );
        });
    }

    if (modeId === 'animation') {
        if (keyframes.length < 2) return null;

        return keyframes.slice(0, -1).map((keyframe, index) => {
            const next = keyframes[index + 1];
            const left = (Math.max(0, Number(keyframe?.time ?? 0)) / duration) * 100;
            const right = (Math.max(0, Number(next?.time ?? 0)) / duration) * 100;
            return (
                <div
                    key={`anim-${track.id}-${index}`}
                    style={{
                        position: 'absolute',
                        left: `${left}%`,
                        width: `${Math.max(2, right - left)}%`,
                        top: 5,
                        height: 8,
                        borderRadius: 999,
                        background: 'rgba(15, 118, 110, 0.18)',
                        border: '1px solid rgba(15, 118, 110, 0.22)',
                    }}
                />
            );
        });
    }

    if (modeId === 'video') {
        const segments = keyframes.length > 1 ? keyframes.slice(0, -1) : [{ time: 0 }, { time: duration }];
        return segments.map((keyframe, index) => {
            const nextTime =
                keyframes.length > 1
                    ? Number(keyframes[index + 1]?.time ?? duration)
                    : duration;
            const startTime = Number(keyframe?.time ?? 0);
            const left = (Math.max(0, startTime) / duration) * 100;
            const width = Math.max(10, ((Math.max(startTime, nextTime) - startTime) / duration) * 100);
            return (
                <div
                    key={`video-${track.id}-${index}`}
                    style={{
                        position: 'absolute',
                        left: `${left}%`,
                        width: `${width}%`,
                        top: 3,
                        height: 12,
                        borderRadius: 6,
                        background: 'rgba(251, 146, 60, 0.24)',
                        border: '1px solid rgba(234, 88, 12, 0.25)',
                    }}
                />
            );
        });
    }

    const bars = keyframes.length
        ? keyframes
        : Array.from({ length: 12 }, (_, index) => ({ time: (duration / 12) * index }));

    return bars.map((keyframe, index) => {
        const time = Number(keyframe?.time ?? 0);
        const left = (Math.max(0, time) / duration) * 100;
        const height = 4 + ((index % 4) + 1) * 2;
        return (
            <div
                key={`podcast-${track.id}-${index}`}
                style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: `${9 - Math.min(8, height / 2)}px`,
                    width: 3,
                    height,
                    borderRadius: 999,
                    background: accent,
                    opacity: 0.45,
                }}
            />
        );
    });
}

export function MediaTimelinePanel({ mode }) {
    const document = useRuntimeStore((state) => state.document);
    const timeline = useRuntimeStore(selectMediaTimeline);
    const playbackState = useRuntimeStore(selectMediaPlayback);
    const cursorIndex = useRuntimeStore(selectMediaCursorIndex);
    const activeRig = useRuntimeStore(selectActiveRig);
    const activeSequence = useRuntimeStore((state) => selectActiveSequence(state.document));
    const selectedTrackId = useMediaTimelineSelectionStore((state) => state.selectedTrackId);
    const selectedKeyframeId = useMediaTimelineSelectionStore((state) => state.selectedKeyframeId);
    const selectedKeyframeIds = useMediaTimelineSelectionStore((state) => state.selectedKeyframeIds);
    const selectedSequenceClipId = useMediaTimelineSelectionStore((state) => state.selectedSequenceClipId);
    const selectTrack = useMediaTimelineSelectionStore((state) => state.selectTrack);
    const selectKeyframe = useMediaTimelineSelectionStore((state) => state.selectKeyframe);
    const selectSequenceClip = useMediaTimelineSelectionStore((state) => state.selectSequenceClip);
    const tracks = useMemo(() => projectMediaTimelineTracks(timeline), [timeline]);
    const rigTracks = useMemo(
        () =>
            mode.id === 'animation'
                ? projectRigControllerTimelineTracks(activeRig, document?.motion)
                : [],
        [mode.id, activeRig, document?.motion]
    );
    const sequenceTracks = useMemo(
        () => projectSequenceTimelineTracks(activeSequence),
        [activeSequence]
    );
    const playback = useMemo(
        () => projectMediaPlaybackState({ playback: playbackState, cursorIndex, timeline }),
        [playbackState, cursorIndex, timeline]
    );
    const duration = Math.max(1, playback.duration || 1);
    const currentFrame = Math.max(0, Math.min(duration, playback.time || 0));
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [clipDrag, setClipDrag] = useState(null);
    const railRef = useRef(null);
    const tone = laneTone(mode.id);

    function seekTo(frame) {
        const nextFrame = Math.max(0, Math.min(duration, Math.round(frame)));
        timelineIntentClockSeek({ time: nextFrame });
    }

    function seekFromClientX(clientX) {
        const rail = railRef.current;
        if (!rail) return;
        const bounds = rail.getBoundingClientRect();
        if (bounds.width <= 0) return;
        const progress = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
        seekTo(progress * duration);
    }

    function frameFromClientX(clientX, bounds) {
        if (!bounds || bounds.width <= 0) return 0;
        const progress = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
        return Math.round(progress * duration);
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

    useEffect(() => {
        if (!clipDrag) return undefined;

        function handlePointerMove(event) {
            const currentFrameAtPointer = frameFromClientX(event.clientX, clipDrag.bounds);
            const delta = currentFrameAtPointer - clipDrag.anchorFrame;

            if (clipDrag.dragKind === 'move') {
                const span = Math.max(0, clipDrag.initialEnd - clipDrag.initialStart);
                let nextStart = Math.max(0, clipDrag.initialStart + delta);
                let nextEnd = nextStart + span;

                if (nextEnd > duration) {
                    nextEnd = duration;
                    nextStart = Math.max(0, nextEnd - span);
                }

                timelineIntentSequenceClipUpdate({
                    sequenceId: clipDrag.sequenceId,
                    trackId: clipDrag.trackId,
                    clipId: clipDrag.clipId,
                    patch: {
                        start: nextStart,
                        end: nextEnd,
                    },
                });
                return;
            }

            if (clipDrag.dragKind === 'trim-start') {
                const nextStart = Math.max(
                    0,
                    Math.min(clipDrag.initialEnd, clipDrag.initialStart + delta)
                );
                timelineIntentSequenceClipUpdate({
                    sequenceId: clipDrag.sequenceId,
                    trackId: clipDrag.trackId,
                    clipId: clipDrag.clipId,
                    patch: {
                        start: nextStart,
                    },
                });
                return;
            }

            const nextEnd = Math.max(
                clipDrag.initialStart,
                Math.min(duration, clipDrag.initialEnd + delta)
            );
            timelineIntentSequenceClipUpdate({
                sequenceId: clipDrag.sequenceId,
                trackId: clipDrag.trackId,
                clipId: clipDrag.clipId,
                patch: {
                    end: nextEnd,
                },
            });
        }

        function handlePointerUp() {
            setClipDrag(null);
        }

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [clipDrag, duration]);

    const projectedTracks = mode.id === 'animation' && rigTracks.length ? rigTracks : tracks;
    const visibleTracks = projectedTracks.length
        ? projectedTracks
        : mode.trackTypes.map((trackType) => ({ id: trackType, property: trackType, keyframes: [] }));
    const animationGroups = useMemo(
        () => (mode.id === 'animation' ? projectAnimationTrackGroups(visibleTracks) : []),
        [mode.id, visibleTracks]
    );
    const renderedTrackGroups =
        [
            ...(sequenceTracks.length
                ? [
                      {
                          label: 'Sequence Tracks',
                          tracks: sequenceTracks,
                      },
                  ]
                : []),
            ...(mode.id === 'animation'
                ? animationGroups
                : [{ label: `${mode.label} Tracks`, tracks: visibleTracks }]),
        ];

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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span
                        style={{
                            borderRadius: 999,
                            padding: '4px 8px',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: tone.accent,
                            background: tone.active,
                            border: `1px solid ${tone.border}`,
                        }}>
                        {mode.label} overlay
                    </span>
                    {mode.id === 'animation' ? (
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                            Tweens are emphasized between keyframes.
                        </span>
                    ) : null}
                    {mode.id === 'video' ? (
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                            Clip spans and edit blocks are emphasized on each lane.
                        </span>
                    ) : null}
                    {mode.id === 'podcast' ? (
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                            Cue density and waveform-style pulses are emphasized on each lane.
                        </span>
                    ) : null}
                </div>
                <div
                    ref={railRef}
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
            <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
                {renderedTrackGroups.map((group) => (
                    <div key={group.label} style={{ display: 'grid', gap: 8 }}>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                color: '#64748b',
                            }}>
                            {group.label}
                        </div>
                        {group.tracks.map((track) => (
                            <div
                                key={track.id}
                                onClick={() => selectTrack(track.id)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '140px minmax(0, 1fr) auto',
                                    alignItems: 'center',
                                    gap: 12,
                                    borderRadius: 10,
                                    background:
                                        selectedTrackId === track.id ? tone.active : '#e2e8f0',
                                    border:
                                        selectedTrackId === track.id
                                            ? `1px solid ${tone.border}`
                                            : '1px solid transparent',
                                    padding: '8px 10px',
                                    fontSize: 12,
                                    color: '#334155',
                                    cursor: 'pointer',
                                }}>
                                <span style={{ fontWeight: 600 }}>
                                    {track.property || track.id}
                                    {selectedTrackId === track.id ? ' · active' : ''}
                                </span>
                                <div
                                    style={{
                                        position: 'relative',
                                        height: 18,
                                        borderRadius: 999,
                                        background: 'rgba(255,255,255,0.6)',
                                        overflow: 'hidden',
                                    }}>
                                    {renderModeOverlay({
                                        modeId: mode.id,
                                        track,
                                        duration,
                                        accent: tone.accent,
                                    })}
                                    {(track.kind === 'sequence-track' ? track.clips || [] : []).map((clip) => {
                                        const start = Number(clip?.start ?? 0);
                                        const end = Math.max(start, Number(clip?.end ?? start));
                                        const widthPercent = Math.max(2, ((end - start) / duration) * 100);
                                        return (
                                            <button
                                                key={`clip-${track.id}-${clip.id}`}
                                                type='button'
                                                onPointerDown={(event) => {
                                                    event.stopPropagation();
                                                    event.preventDefault();
                                                    timelineIntentClockPause();
                                                    selectSequenceClip({ trackId: track.id, clipId: clip.id });
                                                    const bounds = event.currentTarget.parentElement?.getBoundingClientRect();
                                                    const clipBounds = event.currentTarget.getBoundingClientRect();
                                                    const edgeThreshold = Math.min(8, clipBounds.width / 4);
                                                    const offsetX = event.clientX - clipBounds.left;
                                                    const dragKind =
                                                        offsetX <= edgeThreshold
                                                            ? 'trim-start'
                                                            : clipBounds.width - offsetX <= edgeThreshold
                                                            ? 'trim-end'
                                                            : 'move';
                                                    setClipDrag({
                                                        sequenceId: track.sequenceId,
                                                        trackId: String(track.id).split(':').at(-1),
                                                        clipId: clip.id,
                                                        dragKind,
                                                        initialStart: start,
                                                        initialEnd: end,
                                                        anchorFrame: frameFromClientX(event.clientX, bounds),
                                                        bounds,
                                                    });
                                                    if (dragKind !== 'move') {
                                                        seekTo(start);
                                                    }
                                                }}
                                                title={clip?.label ?? clip?.id}
                                                style={{
                                                    position: 'absolute',
                                                    left: `${(Math.max(0, start) / duration) * 100}%`,
                                                    width: `${widthPercent}%`,
                                                    top: 3,
                                                    height: 12,
                                                    borderRadius: 6,
                                                    border:
                                                        selectedSequenceClipId === clip.id
                                                            ? '1px solid rgba(15, 23, 42, 0.45)'
                                                            : '1px solid rgba(30, 41, 59, 0.2)',
                                                    background:
                                                        selectedSequenceClipId === clip.id
                                                            ? 'rgba(15, 23, 42, 0.24)'
                                                            : 'rgba(30, 41, 59, 0.12)',
                                                    padding: 0,
                                                    cursor:
                                                        selectedSequenceClipId === clip.id
                                                            ? 'grab'
                                                            : 'pointer',
                                                }}
                                            />
                                        );
                                    })}
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
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    timelineIntentClockPause();
                                                    selectKeyframe({
                                                        trackId: track.id,
                                                        keyframeId: keyframe.id ?? `${track.id}-${keyframeTime}`,
                                                        additive: event.shiftKey || event.metaKey || event.ctrlKey,
                                                        toggle: event.metaKey || event.ctrlKey,
                                                    });
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
                                                    border:
                                                        selectedKeyframeIds.includes(keyframe.id ?? `${track.id}-${keyframeTime}`)
                                                            ? '1px solid rgba(15, 23, 42, 0.45)'
                                                            : '1px solid rgba(15, 23, 42, 0.2)',
                                                    background:
                                                        selectedKeyframeIds.includes(keyframe.id ?? `${track.id}-${keyframeTime}`)
                                                            ? '#0f172a'
                                                            : tone.marker,
                                                    boxShadow:
                                                        selectedKeyframeIds.includes(keyframe.id ?? `${track.id}-${keyframeTime}`)
                                                            ? '0 0 0 2px rgba(15, 23, 42, 0.15)'
                                                            : 'none',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                <span style={{ color: '#64748b' }}>
                                    {track.kind === 'sequence-track'
                                        ? `${track.clips?.length ?? 0} clips`
                                        : `${track.keyframes.length} keyframes`}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
