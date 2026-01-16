import { canvasBus } from '@/ui/canvasBus';
import { alignNodes, distributeNodes } from '@/ui/alignment/alignmentUtils';

function applyLayoutUpdates({ updates, emit, intentType, source }) {
    if (!updates || updates.length === 0) return [];

    canvasBus.emit('intent.edit.begin', {
        type: intentType,
        ids: updates.map((u) => u.id),
        source: source || 'toolbar',
    });

    updates.forEach(({ id, layout }) => {
        emit?.({
            type: 'node.layout.move',
            payload: {
                nodeId: id,
                x: layout.x,
                y: layout.y,
            },
        });
    });

    if (intentType) {
        canvasBus.emit('intent.edit.commit', {
            type: intentType,
            ids: updates.map((u) => u.id),
            source: source || 'toolbar',
        });
    }

    return updates;
}

export const CapabilityActions = {
    alignLeft(nodes, emit) {
        return applyLayoutUpdates({
            updates: alignNodes(nodes, 'x', 'start'),
            emit,
            intentType: 'align',
        });
    },
    alignCenterX(nodes, emit) {
        return applyLayoutUpdates({
            updates: alignNodes(nodes, 'x', 'center'),
            emit,
            intentType: 'align',
        });
    },
    alignRight(nodes, emit) {
        return applyLayoutUpdates({
            updates: alignNodes(nodes, 'x', 'end'),
            emit,
            intentType: 'align',
        });
    },
    alignTop(nodes, emit) {
        return applyLayoutUpdates({
            updates: alignNodes(nodes, 'y', 'start'),
            emit,
            intentType: 'align',
        });
    },
    alignCenterY(nodes, emit) {
        return applyLayoutUpdates({
            updates: alignNodes(nodes, 'y', 'center'),
            emit,
            intentType: 'align',
        });
    },
    alignBottom(nodes, emit) {
        return applyLayoutUpdates({
            updates: alignNodes(nodes, 'y', 'end'),
            emit,
            intentType: 'align',
        });
    },
    distributeX(nodes, emit) {
        return applyLayoutUpdates({
            updates: distributeNodes(nodes, 'x'),
            emit,
            intentType: 'distribute',
        });
    },
    distributeY(nodes, emit) {
        return applyLayoutUpdates({
            updates: distributeNodes(nodes, 'y'),
            emit,
            intentType: 'distribute',
        });
    },
};
