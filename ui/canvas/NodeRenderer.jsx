import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { useNodeDrag } from './hooks/useNodeDrag.js';

export function NodeRenderer({ nodeId }) {
    const node = useAnimatedRuntimeStore((s) => s.nodes[nodeId]);
    const drag = useNodeDrag(nodeId);

    if (!node) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: node.x ?? 0,
                top: node.y ?? 0,
                width: node.width ?? 100,
                height: node.height ?? 100,
            }}
            onPointerDown={drag.onPointerDown}
            onPointerMove={(e) => drag.onPointerMove(e, node)}
            onPointerUp={drag.onPointerUp}>
            {node.type}
        </div>
    );
}
