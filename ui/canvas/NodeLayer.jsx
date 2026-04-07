'use client';

import { useCharacterRenderNodes } from '@/ui/canvas/hooks/useCharacterRenderNodes.js';
import { NodeRenderer } from './NodeRenderer.jsx';

export default function NodeLayer() {
    const nodes = useCharacterRenderNodes();

    return Object.values(nodes).map((node) => <NodeRenderer key={node.id} node={node} />);
}
