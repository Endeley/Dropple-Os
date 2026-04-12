'use client';

import { useRef } from 'react';
import { useShotEditorIntent } from '@/ui/workspace/editor/shotEditorIntent.js';
import { clampTransitionDuration } from '@/runtime/interaction/shotTransitionConstraints.js';

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function resolveShotStartMs(shot) {
    if (!shot || typeof shot !== 'object') return 0;
    if (Number.isFinite(shot.startMs)) return Number(shot.startMs);
    return safeNumber(shot.start);
}

function resolveShotEndMs(shot) {
    if (!shot || typeof shot !== 'object') return 0;
    if (Number.isFinite(shot.endMs)) return Number(shot.endMs);
    return resolveShotStartMs(shot) + safeNumber(shot.duration);
}

function resolveTransition(shot) {
    const candidate = shot?.transitionOut;
    if (!candidate || typeof candidate !== 'object') {
        return {
            type: 'cut',
            durationMs: 0,
        };
    }

    return {
        type: candidate.type === 'crossfade' ? 'crossfade' : 'cut',
        durationMs: Math.max(0, safeNumber(candidate.durationMs)),
    };
}

export default function TransitionHandle({
    fromShot,
    toShot,
    pixelsPerMs,
    trackHeight = 32,
    topPx = 0,
}) {
    const intent = useShotEditorIntent();
    const dragStateRef = useRef(null);
    const transition = resolveTransition(fromShot);
    const durationMs = transition.durationMs;
    const fromEndMs = resolveShotEndMs(fromShot);
    const overlayWidth = Math.max(0, durationMs * pixelsPerMs);
    const handleLeft = Math.max(0, fromEndMs * pixelsPerMs - 3);

    function cleanupListeners() {
        if (typeof window === 'undefined') return;
        const state = dragStateRef.current;
        if (!state) return;
        window.removeEventListener('pointermove', state.onPointerMove);
        window.removeEventListener('pointerup', state.onPointerUp);
        dragStateRef.current = null;
    }

    function onPointerDown(event) {
        if (typeof window === 'undefined' || !fromShot?.id || !toShot?.id || pixelsPerMs <= 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const startX = event.clientX;
        const startDurationMs = durationMs;

        const onPointerMove = (moveEvent) => {
            const deltaPx = moveEvent.clientX - startX;
            const rawDurationMs = startDurationMs + deltaPx / pixelsPerMs;
            const nextDurationMs = clampTransitionDuration({
                durationMs: Math.round(rawDurationMs),
                fromShot,
                toShot,
            });

            intent.update({
                shotId: fromShot.id,
                patch: {
                    transitionOut:
                        nextDurationMs > 0
                            ? {
                                  type: 'crossfade',
                                  durationMs: nextDurationMs,
                              }
                            : {
                                  type: 'cut',
                                  durationMs: 0,
                              },
                },
            });
        };

        const onPointerUp = () => {
            cleanupListeners();
        };

        dragStateRef.current = { onPointerMove, onPointerUp };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp, { once: true });
    }

    return (
        <>
            {overlayWidth > 0 ? (
                <div
                    aria-hidden='true'
                    style={{
                        position: 'absolute',
                        left: Math.max(0, fromEndMs * pixelsPerMs - overlayWidth),
                        top: topPx,
                        width: overlayWidth,
                        height: trackHeight,
                        background:
                            'linear-gradient(90deg, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.2) 100%)',
                        borderRight: '1px solid rgba(37,99,235,0.3)',
                        pointerEvents: 'none',
                    }}
                />
            ) : null}
            <button
                type='button'
                aria-label={`Adjust transition from ${fromShot?.name ?? fromShot?.id ?? 'shot'} to ${
                    toShot?.name ?? toShot?.id ?? 'shot'
                }`}
                title={`Transition: ${durationMs}ms`}
                onPointerDown={onPointerDown}
                style={{
                    position: 'absolute',
                    left: handleLeft,
                    top: topPx,
                    width: 6,
                    height: trackHeight,
                    cursor: 'ew-resize',
                    border: 0,
                    padding: 0,
                    background: 'rgba(37,99,235,0.7)',
                    borderRadius: 3,
                    zIndex: 3,
                }}
            />
        </>
    );
}
