// collab/CanvasIntentGhosts.jsx

'use client';

import React from 'react';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';

/**
 * Remote intent ghost layer.
 *
 * 🔒 Visual only
 */
export default function CanvasIntentGhosts({ intents }) {
    const nodes = useAnimatedRuntimeStore((s) => s.nodes);

    if (!Array.isArray(intents) || intents.length === 0) return null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 30,
            }}
        >
            {intents.map((user) =>
                user.intent.nodeIds.map((id) => {
                    const node = nodes[id];
                    if (!node) return null;

                    const dx = user.intent.delta?.x ?? 0;
                    const dy = user.intent.delta?.y ?? 0;

                    const width = user.intent.resize?.width ?? node.width;
                    const height = user.intent.resize?.height ?? node.height;

                    return (
                        <div
                            key={`${user.userId}-${id}`}
                            style={{
                                position: 'absolute',
                                left: node.x + dx,
                                top: node.y + dy,
                                width,
                                height,
                                border: `1px dashed ${user.color ?? '#f472b6'}`,
                                background: 'rgba(244,114,182,0.08)',
                                borderRadius: 4,
                            }}
                        />
                    );
                })
            )}
        </div>
    );
}
