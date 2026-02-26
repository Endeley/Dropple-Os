import { hashTimeline } from '../../domain/timeline/TimelineContract.js';

export function createSnapshotNode(timeline, parentIds = [], diff = null) {
    const id = hashTimeline(timeline);

    return {
        id,
        timeline,
        parentIds,
        childrenIds: [],
        diffFromParent: diff,
    };
}

export function createSnapshotGraph(initialTimeline) {
    const createdAt = Date.now();
    const root = createSnapshotNode(initialTimeline);

    return {
        nodes: {
            [root.id]: root,
        },
        headId: root.id,
        meta: {
            [root.id]: {
                label: '',
                createdAt,
                updatedAt: createdAt,
            },
        },
    };
}

export function assertSnapshotIntegrity(node) {
    const expected = hashTimeline(node.timeline);
    if (node.id !== expected) {
        throw new Error('Snapshot hash mismatch');
    }
}
