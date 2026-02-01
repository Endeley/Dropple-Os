'use client';

import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';

/**
 * CanvasGhostLayer
 *
 * Renders transient "ghost" nodes (drag preview, insert preview, etc.)
 * - World-space rendered
 * - Read-only
 * - Never clips
 * - Zero side effects
 */
export default function CanvasGhostLayer() {
    const viewport = useWorkspaceState((s) => s.viewport) || { x: 0, y: 0, scale: 1 };

    const ghostNodes = useAnimatedRuntimeStore((s) => s.ghostNodes);

    if (!ghostNodes || Object.keys(ghostNodes).length === 0) {
        return null;
    }

    return (
        <div
            aria-hidden
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',

                // 🔑 World transform — matches CanvasRoot
                transform: `
                    translate(${-viewport.x}px, ${-viewport.y}px)
                    scale(${viewport.scale})
                `,
                transformOrigin: '0 0',
            }}>
            {Object.values(ghostNodes).map((node) => {
                const x = node.x ?? node.layout?.x ?? 0;
                const y = node.y ?? node.layout?.y ?? 0;
                const width = node.width ?? node.layout?.width ?? 0;
                const height = node.height ?? node.layout?.height ?? 0;

                return (
                    <div
                        key={node.id}
                        style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            width,
                            height,

                            border: '1px dashed rgba(59,130,246,0.8)',
                            background: 'rgba(59,130,246,0.08)',
                            boxSizing: 'border-box',

                            // subtle polish
                            borderRadius: 6,
                        }}
                    />
                );
            })}
        </div>
    );
}
