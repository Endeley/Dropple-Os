import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { useTimelinePreviewStore } from '@/runtime/stores/useTimelinePreviewStore.js';
import { canvasBus } from '@/ui/canvasBus.js';
import { MoveSession } from '@/input/sessions/MoveSession.js';

export function NodeRenderer({ nodeId }) {
    const preview = useTimelinePreviewStore((s) => ({ active: s.active, nodes: s.nodes }));
    const runtimeNode = useAnimatedRuntimeStore((s) => s.nodes[nodeId]);
    const node = preview.active ? preview.nodes[nodeId] : runtimeNode;

    if (!node) return null;

    function onPointerDown(e) {
        e.preventDefault();
        const session = new MoveSession({
            nodeIds: [node.id],
            startPointer: { x: e.clientX, y: e.clientY },
        });
        canvasBus.emit('pointer.down', { session, event: e });
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: node.x ?? 0,
                top: node.y ?? 0,
                width: node.width ?? 100,
                height: node.height ?? 100,
            }}
            onPointerDown={onPointerDown}
        >
            {node.type ?? nodeId}
        </div>
    );
}
