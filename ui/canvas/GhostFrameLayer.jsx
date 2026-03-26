'use client';

import { useMemo } from 'react';
import { useWorkspaceViewState } from '@/runtime/projection';
import { useTimelineStore } from '@/runtime/stores/useTimelineStore.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useOnionSkinStore } from '@/ui/animation/useOnionSkinStore.js';
import { evaluateGhostFrames } from '@/ui/animation/evaluateGhostFrames.js';

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? value : fallback;
}

export default function GhostFrameLayer({ designState }) {
    const viewport = useWorkspaceViewState((s) => s.viewport) || { x: 0, y: 0, scale: 1 };
    const frameTime = useRuntimeStore((s) => s.frameTime);
    const isScrubbing = useTimelineStore((s) => s.isScrubbing);
    const enabled = useOnionSkinStore((s) => s.enabled);
    const prevFrames = useOnionSkinStore((s) => s.prevFrames);
    const nextFrames = useOnionSkinStore((s) => s.nextFrames);
    const stepMs = useOnionSkinStore((s) => s.stepMs);
    const baseOpacity = useOnionSkinStore((s) => s.opacity);
    const previewInterpolation = useTimelineStore((s) => s.previewInterpolation);
    const keyframeTimes = useTimelineStore((s) => s.keyframeTimes);

    const frames = useMemo(() => {
        if (!enabled || !isScrubbing) return [];
        const step = Number.isFinite(stepMs) && stepMs > 0 ? stepMs : 100;
        const offsets = [];

        for (let i = 1; i <= (prevFrames || 0); i += 1) {
            offsets.push(-i * step);
        }
        for (let i = 1; i <= (nextFrames || 0); i += 1) {
            offsets.push(i * step);
        }

        if (!offsets.length) return [];
        return evaluateGhostFrames({
            designState,
            baseTimeMs: frameTime,
            offsetsMs: offsets,
            previewInterpolation,
            keyframeTimes,
        });
    }, [enabled, isScrubbing, prevFrames, nextFrames, stepMs, frameTime, designState, previewInterpolation, keyframeTimes]);

    if (!frames.length) return null;

    return (
        <div
            aria-hidden
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
            }}
        >
            {frames.map((frame) => {
                const distance = Math.max(1, Math.round(Math.abs(frame.offsetMs) / (stepMs || 1)));
                const opacity = Math.max(0, baseOpacity * (1 - (distance - 1) * 0.2));
                const tint = frame.offsetMs > 0
                    ? { stroke: 'rgba(16,185,129,0.7)', fill: 'rgba(16,185,129,0.08)' }
                    : { stroke: 'rgba(59,130,246,0.7)', fill: 'rgba(59,130,246,0.08)' };

                return Object.values(frame.nodes || {}).map((node) => {
                    const layout = node.layout;
                    if (!layout) return null;
                    const vx = viewport.x;
                    const vy = viewport.y;
                    const vs = viewport.scale;
                    const x = safeNumber(layout.x);
                    const y = safeNumber(layout.y);
                    const width = safeNumber(layout.width);
                    const height = safeNumber(layout.height);
                    const left = (x - vx) * vs;
                    const top = (y - vy) * vs;
                    const scaledWidth = width * vs;
                    const scaledHeight = height * vs;
                    if (![left, top, scaledWidth, scaledHeight].every(Number.isFinite)) return null;

                    return (
                        <div
                            key={`${frame.offsetMs}-${frame.timeMs}-${node.id}`}
                            style={{
                                position: 'absolute',
                                left,
                                top,
                                width: scaledWidth,
                                height: scaledHeight,
                                boxSizing: 'border-box',
                                border: `1px dashed ${tint.stroke}`,
                                background: tint.fill,
                                opacity,
                                filter: 'grayscale(1)',
                                borderRadius: 6,
                            }}
                        />
                    );
                });
            })}
        </div>
    );
}
