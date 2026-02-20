'use client';

import { useWorkspaceProjection } from '@/runtime/projection';
import { projectToViewport } from '@/canvas/transform/projectToViewport.js';

/**
 * Read-only snap guide renderer.
 * Consumes SnapGuide[] from computeSnapGuides.
 */
export default function CanvasSnapGuides({ guides }) {
    // ✅ Hook is always called
    const viewport = useWorkspaceProjection((state) => state.viewport) || { x: 0, y: 0, scale: 1 };

    // ✅ Early return AFTER hooks
    if (!guides || guides.length === 0) return null;

    return (
        <>
            {guides.map((guide, i) => {
                if (guide.axis === 'x') {
                    const x = projectToViewport({ x: guide.value, y: 0 }, viewport).x;
                    const y1 = projectToViewport({ x: 0, y: guide.from }, viewport).y;
                    const y2 = projectToViewport({ x: 0, y: guide.to }, viewport).y;
                    const dashed = guide.kind === 'center' || guide.kind === 'spacing';
                    const opacity = guide.kind === 'spacing' ? 0.5 : 0.8;

                    return (
                        <div
                            key={`snap-x-${i}`}
                            style={{
                                position: 'absolute',
                                left: x,
                                top: Math.min(y1, y2),
                                height: Math.abs(y2 - y1),
                                width: 1,
                                background: `rgba(59,130,246,${opacity})`,
                                pointerEvents: 'none',
                                borderLeft: dashed ? `1px dashed rgba(59,130,246,${opacity})` : undefined,
                            }}
                        />
                    );
                }

                if (guide.axis === 'y') {
                    const y = projectToViewport({ x: 0, y: guide.value }, viewport).y;
                    const x1 = projectToViewport({ x: guide.from, y: 0 }, viewport).x;
                    const x2 = projectToViewport({ x: guide.to, y: 0 }, viewport).x;
                    const dashed = guide.kind === 'center' || guide.kind === 'spacing';
                    const opacity = guide.kind === 'spacing' ? 0.5 : 0.8;

                    return (
                        <div
                            key={`snap-y-${i}`}
                            style={{
                                position: 'absolute',
                                top: y,
                                left: Math.min(x1, x2),
                                width: Math.abs(x2 - x1),
                                height: 1,
                                background: `rgba(59,130,246,${opacity})`,
                                pointerEvents: 'none',
                                borderTop: dashed ? `1px dashed rgba(59,130,246,${opacity})` : undefined,
                            }}
                        />
                    );
                }

                return null;
            })}
        </>
    );
}
