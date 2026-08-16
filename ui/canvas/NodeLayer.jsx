'use client';

import { useMemo, useState, useCallback } from 'react';
import { useCharacterRenderNodes } from '@/ui/canvas/hooks/useCharacterRenderNodes.js';
import { NodeRenderer } from './NodeRenderer.jsx';

export default function NodeLayer() {
    const nodesMap = useCharacterRenderNodes();
    const [hoveredId, setHoveredId] = useState(null);
    const resolveDepth = useCallback((nodeId) => {
        let depth = 0;
        let currentId = nodeId;
        const visited = new Set();

        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const parentId = nodesMap?.[currentId]?.parentId ?? null;
            if (!parentId) break;
            depth += 1;
            currentId = parentId;
        }

        return depth;
    }, [nodesMap]);

    // ----- DETERMINISTIC ORDER -----
    const nodes = useMemo(() => {
        return Object.values(nodesMap || {}).sort((a, b) => {
            // stable ordering: zIndex → id
            const za = a?.zIndex ?? 0;
            const zb = b?.zIndex ?? 0;

            if (za !== zb) return za - zb;

            const depthDelta = resolveDepth(a?.id) - resolveDepth(b?.id);
            if (depthDelta !== 0) return depthDelta;

            return String(a.id).localeCompare(String(b.id));
        });
    }, [nodesMap, resolveDepth]);

    const handleEnter = useCallback((id) => {
        setHoveredId(id);
    }, []);

    const handleLeave = useCallback(() => {
        setHoveredId(null);
    }, []);

    return (
        <>
            {nodes.map((node) => {
                const isHovered = hoveredId === node.id;

                return (
                    <div
                        key={node.id}
                        className={`node-wrapper ${isHovered ? 'is-hovered' : ''}`}
                        data-node-id={node.id}
                        data-pointer-role='node-wrapper'
                        onPointerEnter={() => handleEnter(node.id)}
                        onPointerLeave={handleLeave}>
                        <NodeRenderer node={node} />
                    </div>
                );
            })}
        </>
    );
}
