'use client';

import React, { memo } from 'react';
import { NodeView } from '@/ui/NodeView.jsx';

function NodeRendererImpl({ node }) {
    if (!node) return null;

    return <NodeView node={node} />;
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
