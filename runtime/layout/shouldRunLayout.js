// runtime/layout/shouldRunLayout.js

import { EventTypes } from '@/core/events/eventTypes.js';
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
    EventTypes.NODE_RESIZE,
    'node.content.update',
    'text.content.update',
    'image.source.update',
    'node.layout.move',
    'node.layout.resize',
    'node.layout.rotate',
    'node.layout.update',
    'node.layout.bulk',
    'node.layout.setConstraint',
    'node.layout.clearConstraint',
    'node.layout.setAutoLayout',
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
