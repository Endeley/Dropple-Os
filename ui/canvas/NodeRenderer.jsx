'use client';

import React, { memo } from 'react';
import { NodeView } from '@/ui/NodeView.jsx';
import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';
import { projectToViewport } from '@/canvas/transform/projectToViewport.js';

function NodeRendererImpl({ node }) {
    if (!node) return null;
    const viewport = useWorkspaceState((state) => state.viewport);
    const position = viewport ? projectToViewport(node, viewport) : undefined;
    const scale = viewport?.scale ?? 1;

    return <NodeView node={node} position={position} scale={scale} />;
}

export const NodeRenderer = memo(
    NodeRendererImpl,
    (prev, next) => {
        const a = prev.node;
        const b = next.node;
        if (!a || !b) return a === b;

        return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height && a.opacity === b.opacity;
    }
);
