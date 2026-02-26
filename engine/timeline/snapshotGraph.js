import { hashTimeline } from '../../domain/timeline/TimelineContract.js';

export function createSnapshotNode(timeline, parentIds = [], diff = null) {
    const id = hashTimeline(timeline);

    return {
        id,
        timeline,
        parentIds,
        childrenIds: [],
        diffFromParent: diff,
        meta: {
            createdAt: Date.now(),
        },
    };
}

export function createSnapshotGraph(initialTimeline) {
    const root = createSnapshotNode(initialTimeline);

    return {
        nodes: {
            [root.id]: root,
        },
        headId: root.id,
    };
}

export function assertSnapshotIntegrity(node) {
    const expected = hashTimeline(node.timeline);
    if (node.id !== expected) {
        throw new Error('Snapshot hash mismatch');
    }
}
