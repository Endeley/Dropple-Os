'use client';

import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { NodeRenderer } from './NodeRenderer.jsx';

export default function NodeLayer() {
    const nodes = useAnimatedRuntimeStore((s) => s.nodes);

    return Object.values(nodes).map((node) => <NodeRenderer key={node.id} nodeId={node.id} />);
}
