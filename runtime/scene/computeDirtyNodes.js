export function computeDirtyNodes({ event, document }) {
    const dirty = new Set();

    if (!event) return dirty;

    const payload = event.payload || {};

    switch (event.type) {
        case 'node/create':
            if (payload.node?.id) dirty.add(payload.node.id);
            break;

        case 'node/delete':
            if (payload.nodeId) dirty.add(payload.nodeId);
            break;

        case 'node/reparent':
            if (payload.nodeId) dirty.add(payload.nodeId);
            if (payload.newParentId) dirty.add(payload.newParentId);
            if (payload.oldParentId) dirty.add(payload.oldParentId);
            break;

        case 'node/transform':
        case 'node/resize':
        case 'node/update':
        case 'layout/update':
        case 'motion/update':
            if (payload.nodeId) dirty.add(payload.nodeId);
            break;

        default:
            break;
    }

    return dirty;
}
