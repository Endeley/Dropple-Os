import { markDirtyDomain } from './markDirtyDomain.js';

function forEachId(input, fn) {
    if (!input) return;
    if (Array.isArray(input)) {
        input.forEach((id) => fn(id));
        return;
    }
    fn(input);
}

export function computeDirtyDomains({ event, runtime }) {
    const payload = event?.payload ?? {};

    const addTransform = (id) => markDirtyDomain(runtime, id, 'transformDirty');
    const addLayout = (id) => markDirtyDomain(runtime, id, 'layoutDirty');
    const addPaint = (id) => markDirtyDomain(runtime, id, 'paintDirty');

    switch (event?.type) {
        case 'node/create':
            addTransform(payload.node?.id);
            addLayout(payload.node?.parentId);
            break;

        case 'node/delete':
            addLayout(payload.parentId ?? payload.oldParentId);
            break;

        case 'node/attach':
            addLayout(payload.parentId);
            forEachId(payload.childId ?? payload.childIds, addTransform);
            break;

        case 'node/reparent':
            addLayout(payload.newParentId);
            addLayout(payload.oldParentId);
            addTransform(payload.nodeId);
            break;

        case 'node/wrap':
            addLayout(payload.parentId ?? payload.wrapperNode?.parentId);
            addTransform(payload.wrapperNode?.id);
            forEachId(payload.nodeIds, addTransform);
            break;

        case 'node/unwrap':
            addLayout(payload.parentId);
            addTransform(payload.nodeId);
            break;

        case 'node/transform':
        case 'node/move':
        case 'motion/update':
            forEachId(payload.nodeId ?? payload.nodeIds, addTransform);
            break;

        case 'node/resize':
            forEachId(payload.nodeId ?? payload.nodeIds, addTransform);
            forEachId(payload.nodeId ?? payload.nodeIds, addLayout);
            break;

        case 'layout/update':
            forEachId(payload.nodeId ?? payload.nodeIds, addLayout);
            break;

        case 'node/style-update':
        case 'node.style.update':
            forEachId(payload.nodeId ?? payload.nodeIds, addPaint);
            break;

        case 'node/update':
            forEachId(payload.nodeId ?? payload.nodeIds, addTransform);
            forEachId(payload.nodeId ?? payload.nodeIds, addPaint);
            break;

        default:
            break;
    }

    return {
        transformDirty: runtime?.scene?.transformDirty ?? new Set(),
        layoutDirty: runtime?.scene?.layoutDirty ?? new Set(),
        paintDirty: runtime?.scene?.paintDirty ?? new Set(),
        indexDirty: runtime?.scene?.indexDirty ?? new Set(),
    };
}
