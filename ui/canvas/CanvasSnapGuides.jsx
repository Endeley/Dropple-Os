'use client';

import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';
import { projectToViewport } from '@/canvas/transform/projectToViewport.js';

export default function CanvasSnapGuides({ guides }) {
    if (!guides || guides.length === 0) return null;
    const viewport = useWorkspaceState((state) => state.viewport) || { x: 0, y: 0, scale: 1 };

    return (
        <>
            {guides.map((guide) => {
                if (guide.type === 'vertical') {
                    const left = projectToViewport({ x: guide.x ?? 0, y: 0 }, viewport).x;
                    return (
                        <div
                            key={guide.id}
                            style={{
                                position: 'absolute',
                                left,
                                top: 0,
                                bottom: 0,
                                width: 1,
                                background: 'rgba(59,130,246,0.8)',
                                pointerEvents: 'none',
                            }}
                        />
                    );
                }

                if (guide.type === 'horizontal') {
                    const top = projectToViewport({ x: 0, y: guide.y ?? 0 }, viewport).y;
                    return (
                        <div
                            key={guide.id}
                            style={{
                                position: 'absolute',
                                top,
                                left: 0,
                                right: 0,
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
