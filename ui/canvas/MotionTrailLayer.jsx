'use client';

import { useMemo } from 'react';
import { useSelection } from '@/ui/workspace/shared/SelectionContext.jsx';
import { useTimelineStore } from '@/runtime/stores/useTimelineStore.js';
import { useMotionTrailStore } from '@/ui/animation/useMotionTrailStore.js';
import { evaluateMotionTrails } from '@/ui/animation/evaluateMotionTrails.js';
import { useCanvasRuntimeState, useCanvasViewState } from '@/ui/canvas/CanvasContext.jsx';

function projectPoint(point, viewport) {
    return {
        x: (point.x - viewport.x) * viewport.scale,
        y: (point.y - viewport.y) * viewport.scale,
    };
}

export default function MotionTrailLayer({ designState }) {
    const viewport = useCanvasViewState((s) => s.viewport) || { x: 0, y: 0, scale: 1 };
    const { selectedIds } = useSelection() || {};
    const selected = useMemo(() => Array.from(selectedIds || []), [selectedIds]);

    const enabled = useMotionTrailStore((s) => s.enabled);
    const steps = useMotionTrailStore((s) => s.steps);
    const stepMs = useMotionTrailStore((s) => s.stepMs);
    const opacity = useMotionTrailStore((s) => s.opacity);
    const fade = useMotionTrailStore((s) => s.fade);

    const frameTime = useCanvasRuntimeState((s) => s.frameTime);
    const isPlaying = useTimelineStore((s) => s.isPlaying);
    const previewInterpolation = useTimelineStore((s) => s.previewInterpolation);
    const keyframeTimes = useTimelineStore((s) => s.keyframeTimes);

    const trails = useMemo(() => {
        if (!enabled || isPlaying || selected.length === 0) return {};
        return evaluateMotionTrails({
            designState,
            baseTimeMs: frameTime,
            nodeIds: selected,
            steps,
            stepMs,
            previewInterpolation,
            keyframeTimes,
        });
    }, [
        enabled,
        isPlaying,
        selected,
        designState,
        frameTime,
        steps,
        stepMs,
        previewInterpolation,
        keyframeTimes,
    ]);

    if (!enabled || isPlaying || selected.length === 0) return null;

    return (
        <svg
            aria-hidden
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'visible',
            }}
        >
            {selected.map((nodeId) => {
                const points = trails?.[nodeId] || [];
                if (!points.length) return null;

                return points.map((point, index) => {
                    const proj = projectPoint(point, viewport);
                    const alpha = fade
                        ? Math.max(0.08, opacity * (1 - index / Math.max(1, points.length - 1)))
                        : opacity;

                    return (
                        <circle
                            key={`${nodeId}-${index}`}
                            cx={proj.x}
                            cy={proj.y}
                            r={3}
                            fill={`rgba(249,115,22,${alpha})`}
                            stroke={`rgba(249,115,22,${Math.min(1, alpha + 0.2)})`}
                            strokeWidth={1}
                        />
                    );
                });
            })}
        </svg>
    );
}
