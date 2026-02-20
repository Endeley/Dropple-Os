'use client';

import { useMemo } from 'react';
import { useCharacterRenderNodes } from '@/runtime/characters/useCharacterRenderNodes.js';
import { useWorkspaceProjection } from '@/runtime/projection';
import { useConstraintVisualizerStore } from '@/ui/animation/useConstraintVisualizerStore.js';
import { useTimelineStore } from '@/runtime/stores/useTimelineStore.js';
import { getConstraintVisuals } from '@/ui/animation/getConstraintVisuals.js';

function projectPoint(point, viewport) {
    return {
        x: (point.x - viewport.x) * viewport.scale,
        y: (point.y - viewport.y) * viewport.scale,
    };
}

export default function ConstraintVisualizerLayer() {
    const nodes = useCharacterRenderNodes();
    const viewport = useWorkspaceProjection((s) => s.viewport) || { x: 0, y: 0, scale: 1 };
    const isPlaying = useTimelineStore((s) => s.isPlaying);

    const enabled = useConstraintVisualizerStore((s) => s.enabled);
    const showFollow = useConstraintVisualizerStore((s) => s.showFollow);
    const showPin = useConstraintVisualizerStore((s) => s.showPin);
    const showAim = useConstraintVisualizerStore((s) => s.showAim);
    const showSockets = useConstraintVisualizerStore((s) => s.showSockets);

    const visuals = useMemo(() => getConstraintVisuals({ nodes }), [nodes]);

    if (!enabled || isPlaying) return null;

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
            {showFollow &&
                visuals.followLines.map((line, idx) => {
                    const from = projectPoint(line.from, viewport);
                    const to = projectPoint(line.to, viewport);
                    return (
                        <line
                            key={`follow-${idx}`}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke="rgba(59,130,246,0.5)"
                            strokeDasharray="4 4"
                            strokeWidth={1}
                        />
                    );
                })}

            {showAim &&
                visuals.aimRays.map((ray, idx) => {
                    const from = projectPoint(ray.from, viewport);
                    const to = projectPoint(ray.to, viewport);
                    return (
                        <line
                            key={`aim-${idx}`}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke="rgba(16,185,129,0.6)"
                            strokeDasharray="2 3"
                            strokeWidth={1}
                        />
                    );
                })}

            {showPin &&
                visuals.pinMarkers.map((marker, idx) => {
                    const at = projectPoint(marker.at, viewport);
                    const size = 6;
                    const horiz = marker.axis === 'x' || marker.axis === 'both';
                    const vert = marker.axis === 'y' || marker.axis === 'both';
                    return (
                        <g key={`pin-${idx}`} opacity={0.7}>
                            {horiz && (
                                <line
                                    x1={at.x - size}
                                    y1={at.y}
                                    x2={at.x + size}
                                    y2={at.y}
                                    stroke="rgba(234,88,12,0.7)"
                                    strokeWidth={1}
                                />
                            )}
                            {vert && (
                                <line
                                    x1={at.x}
                                    y1={at.y - size}
                                    x2={at.x}
                                    y2={at.y + size}
                                    stroke="rgba(234,88,12,0.7)"
                                    strokeWidth={1}
                                />
                            )}
                        </g>
                    );
                })}

            {showSockets &&
                visuals.sockets.map((socket, idx) => {
                    const at = projectPoint(socket.at, viewport);
                    return (
                        <g key={`socket-${idx}`} opacity={0.65}>
                            <circle
                                cx={at.x}
                                cy={at.y}
                                r={4}
                                fill="rgba(99,102,241,0.15)"
                                stroke="rgba(99,102,241,0.6)"
                                strokeWidth={1}
                            />
                            <text
                                x={at.x + 6}
                                y={at.y - 6}
                                fill="rgba(99,102,241,0.7)"
                                fontSize={10}
                                fontFamily="monospace"
                            >
                                {socket.name}
                            </text>
                        </g>
                    );
                })}
        </svg>
    );
}
