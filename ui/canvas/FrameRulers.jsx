'use client';

import { projectToViewport } from '@/canvas/transform/projectToViewport.js';
import { getZoomTier } from './zoomTiers.js';

/**
 * Read-only frame-relative rulers.
 * Visual overlay only — NEVER constrains layout.
 */
export default function FrameRulers({ frame, viewport }) {
    const TICK_SPACING_WORLD = 50;
    const LABEL_SPACING_WORLD = 100;
    const MIN_LABEL_SPACING_PX = 24;

    const zoomTier = getZoomTier(viewport.scale);
    if (zoomTier === 'far') return null;

    const x = frame.x ?? frame.layout?.x ?? 0;
    const y = frame.y ?? frame.layout?.y ?? 0;
    const width = frame.width ?? frame.layout?.width ?? 0;
    const height = frame.height ?? frame.layout?.height ?? 0;

    const topLeft = projectToViewport({ x, y }, viewport);
    const topRight = projectToViewport({ x: x + width, y }, viewport);
    const bottomLeft = projectToViewport({ x, y: y + height }, viewport);

    const tickSpacingScreen = TICK_SPACING_WORLD * viewport.scale;
    const labelSpacingScreen = LABEL_SPACING_WORLD * viewport.scale;

    if (tickSpacingScreen < 25) return null;

    const showLabels = labelSpacingScreen >= MIN_LABEL_SPACING_PX;

    const ticksX = Math.floor(width / TICK_SPACING_WORLD);
    const ticksY = Math.floor(height / TICK_SPACING_WORLD);

    // ✅ CRITICAL: never allow zero-size
    const rulerWidth = Math.max(1, topRight.x - topLeft.x);
    const rulerHeight = Math.max(1, bottomLeft.y - topLeft.y);

    return (
        <>
            {/* HORIZONTAL RULER */}
            <div
                style={{
                    position: 'absolute',
                    left: topLeft.x,
                    top: topLeft.y - 20,
                    width: rulerWidth,
                    height: 20,
                    pointerEvents: 'none',
                    background: 'rgba(15,23,42,0.4)',
                    borderBottom: '1px solid rgba(148,163,184,0.4)',
                    contain: 'layout style paint',
                }}>
                {Array.from({ length: ticksX + 1 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: i * tickSpacingScreen,
                            bottom: 0,
                            width: 1,
                            height: i % 2 === 0 ? 10 : 6,
                            background: 'rgba(148,163,184,0.8)',
                        }}
                    />
                ))}

                {showLabels &&
                    Array.from({
                        length: Math.floor(width / LABEL_SPACING_WORLD) + 1,
                    }).map((_, i) => (
                        <div
                            key={`label-x-${i}`}
                            style={{
                                position: 'absolute',
                                left: i * LABEL_SPACING_WORLD * viewport.scale + 2,
                                top: 2,
                                fontSize: 11,
                                color: 'rgba(148,163,184,0.95)',
                                pointerEvents: 'none',
                                userSelect: 'none',
                                whiteSpace: 'nowrap',
                            }}>
                            {i * LABEL_SPACING_WORLD}
                        </div>
                    ))}
            </div>

            {/* VERTICAL RULER */}
            <div
                style={{
                    position: 'absolute',
                    left: topLeft.x - 20,
                    top: topLeft.y,
                    width: 20,
                    height: rulerHeight,
                    pointerEvents: 'none',
                    background: 'rgba(15,23,42,0.4)',
                    borderRight: '1px solid rgba(148,163,184,0.4)',
                    contain: 'layout style paint',
                }}>
                {Array.from({ length: ticksY + 1 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: i * tickSpacingScreen,
                            right: 0,
                            height: 1,
                            width: i % 2 === 0 ? 10 : 6,
                            background: 'rgba(148,163,184,0.8)',
                        }}
                    />
                ))}

                {showLabels &&
                    Array.from({
                        length: Math.floor(height / LABEL_SPACING_WORLD) + 1,
                    }).map((_, i) => (
                        <div
                            key={`label-y-${i}`}
                            style={{
                                position: 'absolute',
                                top: i * LABEL_SPACING_WORLD * viewport.scale + 2,
                                right: 2,
                                fontSize: 11,
                                color: 'rgba(148,163,184,0.95)',
                                pointerEvents: 'none',
                                userSelect: 'none',
                                whiteSpace: 'nowrap',
                            }}>
                            {i * LABEL_SPACING_WORLD}
                        </div>
                    ))}
            </div>
        </>
    );
}
