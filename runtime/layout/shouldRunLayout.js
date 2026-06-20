// runtime/layout/shouldRunLayout.js

import { EventTypes } from '@/core/events/eventTypes.js';
import { NodeMutationTypes } from '@/core/events/nodeMutationTypes.js';
import { getLayout } from '../document/documentAdapter.js';

const LAYOUT_EVENTS = new Set([
    EventTypes.NODE_CREATE,
    EventTypes.NODE_DELETE,
    EventTypes.NODE_ATTACH,
    EventTypes.NODE_DETACH,
    EventTypes.NODE_REPARENT,
    EventTypes.NODE_REORDER,
    EventTypes.NODE_WRAP,
    EventTypes.NODE_UNWRAP,
    EventTypes.NODE_MOVE,
    NodeMutationTypes.CONTENT_UPDATE,
    NodeMutationTypes.TEXT_CONTENT_UPDATE,
    NodeMutationTypes.IMAGE_SOURCE_UPDATE,
    NodeMutationTypes.LAYOUT_ROTATE,
    NodeMutationTypes.LAYOUT_UPDATE,
    NodeMutationTypes.LAYOUT_BULK,
    NodeMutationTypes.LAYOUT_SET_CONSTRAINT,
    NodeMutationTypes.LAYOUT_CLEAR_CONSTRAINT,
    NodeMutationTypes.LAYOUT_SET_AUTO_LAYOUT,
    'layout.node.patch',
    'layout.container.set',
    'layout.container.remove',
    'layout.sizing.set',
    'layout.constraints.set',
    'layout.padding.set',
    'layout.gap.set',
    'layout.align.set',
    'layout.markDirty',
]);

export function shouldRunLayout({ event, runtimeState } = {}) {
    const layout = getLayout(runtimeState);
    const dirty = layout?.dirty;
    const hasDirtyState =
        dirty?.fullPass === true ||
        (Array.isArray(dirty?.nodeIds) && dirty.nodeIds.length > 0);

    if (hasDirtyState) {
        return true;
    }

    return LAYOUT_EVENTS.has(event?.type);
}
