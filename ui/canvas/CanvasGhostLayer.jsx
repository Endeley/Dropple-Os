'use client';

import { useEffect, useState } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { canvasBus } from '@/ui/canvasBus.js';
import CanvasSnapGuides from './CanvasSnapGuides';
import { GhostNode } from './GhostNode';

/**
 * Renders ephemeral ghost previews during active input sessions.
 */
export default function CanvasGhostLayer() {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        function onUpdate(payload) {
            const nextPreview = payload?.preview ?? payload?.session?.getPreview?.();
            if (!nextPreview) return;
            setPreview(nextPreview);
        }

        function clear() {
            setPreview(null);
        }

        canvasBus.on('session.update', onUpdate);
        canvasBus.on('session.commit', clear);
        canvasBus.on('session.cancel', clear);

        return () => {
            canvasBus.off('session.update', onUpdate);
            canvasBus.off('session.commit', clear);
            canvasBus.off('session.cancel', clear);
        };
    }, []);

    if (!preview) return null;

    if (preview.type === 'reorder-preview') {
        return <InsertionLine containerId={preview.containerId} index={preview.index} />;
    }

    return (
        <>
            {preview.type === 'move-preview' && preview.nodeIds?.map((id) => <GhostNode key={id} nodeId={id} delta={preview.delta} />)}

            {preview.type === 'move-preview' && preview.guides && <CanvasSnapGuides guides={preview.guides} />}
        </>
    );
}

/**
 * Visual insertion indicator for auto-layout reordering.
 * Local-only ghost primitive.
 */
function InsertionLine({ containerId, index }) {
    const { container, children, layout } = useRuntimeStore(
        (s) => {
            const node = s.nodes[containerId];
            const ordered = node?.children?.map((id) => s.nodes[id]).filter(Boolean) || [];
            return {
                container: node,
                children: ordered,
                layout: node?.layout || {},
            };
        },
        (a, b) => a.container === b.container && a.children === b.children && a.layout === b.layout
    );

    if (!container) return null;

    const isVertical = layout.mode === 'auto-y';
    const padding = layout.padding ?? 0;
    const gap = layout.gap ?? 0;

    const lineStyle = {
        position: 'absolute',
        background: 'rgba(59,130,246,0.8)',
        pointerEvents: 'none',
    };

    if (isVertical) {
        const y = computeInsertionPosition({
            axis: 'y',
            container,
            children,
            index,
            padding,
            gap,
        });
        lineStyle.left = container.x ?? 0;
        lineStyle.width = container.width ?? 0;
        lineStyle.top = y;
        lineStyle.height = 2;
    } else {
        const x = computeInsertionPosition({
            axis: 'x',
            container,
            children,
            index,
            padding,
            gap,
        });
        lineStyle.top = container.y ?? 0;
        lineStyle.height = container.height ?? 0;
        lineStyle.left = x;
        lineStyle.width = 2;
    }

    return <div style={lineStyle} />;
}

function computeInsertionPosition({ axis, container, children, index, padding, gap }) {
    const isY = axis === 'y';

    if (!children.length) {
        return (isY ? container.y : container.x) + padding;
    }

    const clampedIndex = Math.max(0, Math.min(index ?? 0, children.length));

    if (clampedIndex === 0) {
        const first = children[0];
        return (isY ? first.y : first.x) - gap / 2;
    }

    if (clampedIndex >= children.length) {
        const last = children[children.length - 1];
        const end = isY ? last.y + (last.height ?? 0) : last.x + (last.width ?? 0);
        return end + gap / 2;
    }

    const prev = children[clampedIndex - 1];
    const next = children[clampedIndex];
    const prevEnd = isY ? prev.y + (prev.height ?? 0) : prev.x + (prev.width ?? 0);
    const nextStart = isY ? next.y : next.x;

    return prevEnd + Math.max(0, (nextStart - prevEnd) / 2);
}
