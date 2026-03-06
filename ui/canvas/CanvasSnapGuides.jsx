'use client';

import { useWorkspaceProjection } from '@/runtime/projection';
import { projectToViewport } from '@/canvas/transform/projectToViewport.js';

/**
 * Read-only snap guide renderer.
 * Consumes SnapGuide[] from engine (type, x|y, sourceNodeId).
 */
export default function CanvasSnapGuides({ guides }) {
    // ✅ Hook is always called
    const viewport = useWorkspaceProjection((state) => state.viewport) || { x: 0, y: 0, scale: 1 };

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

                return null;
            })}
        </>
    );
}
