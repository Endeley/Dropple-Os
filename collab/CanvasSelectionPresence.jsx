// collab/CanvasSelectionPresence.jsx

'use client';

import React from 'react';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';

/**
 * Visual-only selection presence layer.
 *
 * 🔒 Non-authoritative
 */
export default function CanvasSelectionPresence({ selections }) {
    const nodes = useAnimatedRuntimeStore((s) => s.nodes);

    if (!Array.isArray(selections) || selections.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 40,
            }}
        >
            {selections.map((user) =>
                user.selectedNodeIds.map((id) => {
                    const node = nodes[id];
                    if (!node) return null;

                    return (
                        <div
                            key={`${user.userId}-${id}`}
                            style={{
                                position: 'absolute',
                                left: node.x,
                                top: node.y,
                                width: node.width,
                                height: node.height,
                                border: `2px dashed ${user.color ?? '#a78bfa'}`,
                                borderRadius: 4,
                                opacity: 0.7,
                            }}
                        />
                    );
                })
            )}
        </div>
    );
}
