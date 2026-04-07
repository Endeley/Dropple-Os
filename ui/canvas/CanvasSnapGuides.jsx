'use client';

import { useCanvasViewState } from '@/ui/canvas/CanvasContext.jsx';
import { projectToViewport } from '@/canvas/transform/projectToViewport.js';

/**
 * Read-only snap guide renderer.
 * Consumes SnapGuide[] from engine (type, x|y, sourceNodeId).
 */
export default function CanvasSnapGuides({ guides }) {
    // ✅ Hook is always called
    const viewport = useCanvasViewState((state) => state.viewport) || { x: 0, y: 0, scale: 1 };

    // ✅ Early return AFTER hooks
    if (!guides || guides.length === 0) return null;

    return (
        <>
            {guides.map((guide, i) => {
                if (guide.type === 'vertical') {
                    const x = projectToViewport({ x: guide.x ?? 0, y: 0 }, viewport).x;
                    return (
                        <div
                            key={`snap-x-${i}`}
                            style={{
                                position: 'absolute',
                                left: x,
                                top: -100000,
                                height: 200000,
                                width: 1,
                                background: 'rgba(59,130,246,0.8)',
                                pointerEvents: 'none',
                            }}
                        />
                    );
                }

                if (guide.type === 'horizontal') {
                    const y = projectToViewport({ x: 0, y: guide.y ?? 0 }, viewport).y;
                    return (
                        <div
                            key={`snap-y-${i}`}
                            style={{
                                position: 'absolute',
                                top: y,
                                left: -100000,
                                width: 200000,
                                height: 1,
                                background: 'rgba(59,130,246,0.8)',
                                pointerEvents: 'none',
                            }}
                        />
                    );
                }

                if (guide.type === 'spacing') {
                    if (guide.axis === 'x') {
                        const start = projectToViewport({ x: guide.from ?? 0, y: guide.y ?? 0 }, viewport);
                        const end = projectToViewport({ x: guide.to ?? 0, y: guide.y ?? 0 }, viewport);
                        const left = Math.min(start.x, end.x);
                        const width = Math.abs(end.x - start.x);

                        return (
                            <div
                                key={`snap-spacing-x-${i}`}
                                style={{
                                    position: 'absolute',
                                    left,
                                    top: start.y,
                                    width,
                                    height: 0,
                                    borderTop: '1px dashed rgba(139,92,246,0.95)',
                                    pointerEvents: 'none',
                                }}>
                                <span
                                    style={{
                                        position: 'absolute',
                                        left: '50%',
                                        top: -18,
                                        transform: 'translateX(-50%)',
                                        background: '#8b5cf6',
                                        color: '#fff',
                                        fontSize: 10,
                                        lineHeight: 1,
                                        padding: '2px 4px',
                                        borderRadius: 3,
                                        whiteSpace: 'nowrap',
                                    }}>
                                    {`${Math.round(guide.spacing)}px`}
                                </span>
                            </div>
                        );
                    }

                    if (guide.axis === 'y') {
                        const start = projectToViewport({ x: guide.x ?? 0, y: guide.from ?? 0 }, viewport);
                        const end = projectToViewport({ x: guide.x ?? 0, y: guide.to ?? 0 }, viewport);
                        const top = Math.min(start.y, end.y);
                        const height = Math.abs(end.y - start.y);

                        return (
                            <div
                                key={`snap-spacing-y-${i}`}
                                style={{
                                    position: 'absolute',
                                    left: start.x,
                                    top,
                                    width: 0,
                                    height,
                                    borderLeft: '1px dashed rgba(139,92,246,0.95)',
                                    pointerEvents: 'none',
                                }}>
                                <span
                                    style={{
                                        position: 'absolute',
                                        left: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: '#8b5cf6',
                                        color: '#fff',
                                        fontSize: 10,
                                        lineHeight: 1,
                                        padding: '2px 4px',
                                        borderRadius: 3,
                                        whiteSpace: 'nowrap',
                                    }}>
                                    {`${Math.round(guide.spacing)}px`}
                                </span>
                            </div>
                        );
                    }
                }

                if (guide.type === 'angle') {
                    return (
                        <div
                            key={`snap-angle-${i}`}
                            style={{
                                position: 'absolute',
                                left: 10,
                                top: 10,
                                color: '#22c55e',
                                fontSize: 10,
                                background: '#111',
                                padding: '2px 4px',
                                borderRadius: 3,
                                pointerEvents: 'none',
                            }}>
                            {`${Math.round((guide.angle * 180) / Math.PI)}deg`}
                        </div>
                    );
                }

                return null;
            })}
        </>
    );
}
