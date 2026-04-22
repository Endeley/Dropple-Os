'use client';

import { useMemo, useState, useCallback } from 'react';
import { useCharacterRenderNodes } from '@/ui/canvas/hooks/useCharacterRenderNodes.js';
import { NodeRenderer } from './NodeRenderer.jsx';

export default function NodeLayer() {
    const nodesMap = useCharacterRenderNodes();
    const [hoveredId, setHoveredId] = useState(null);

    // ----- DETERMINISTIC ORDER -----
    const nodes = useMemo(() => {
        return Object.values(nodesMap || {}).sort((a, b) => {
            // stable ordering: zIndex → id
            const za = a?.zIndex ?? 0;
            const zb = b?.zIndex ?? 0;

            if (za !== zb) return za - zb;

            return String(a.id).localeCompare(String(b.id));
        });
    }, [nodesMap]);

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
                    <div key={node.id} className={`node-wrapper ${isHovered ? 'is-hovered' : ''}`} onPointerEnter={() => handleEnter(node.id)} onPointerLeave={handleLeave}>
                        <NodeRenderer node={node} />
                    </div>
                );
            })}
        </>
    );
}
