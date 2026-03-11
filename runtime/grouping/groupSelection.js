import { EventTypes } from '@/core/events/eventTypes.js';

function generateGroupId(existingIds) {
    let i = 1;

    while (existingIds.has(`group-${i}`)) {
        i += 1;
    }

    return `group-${i}`;
}

export async function groupSelection(selectionIds, dispatcher) {
    const ids = Array.isArray(selectionIds) ? selectionIds.filter(Boolean) : [];
    if (!ids.length || !dispatcher?.dispatch || !dispatcher?.getState) return null;

    const state = dispatcher.getState();
    const nodes = state?.document?.sceneGraph?.nodes ?? state?.nodes ?? {};
    const existingIds = new Set(Object.keys(nodes));
    const groupId = generateGroupId(existingIds);
    const firstNode = nodes[ids[0]];
    const parentId = firstNode?.parentId ?? null;

    await dispatcher.dispatch({
        type: EventTypes.NODE_WRAP,
        payload: {
            nodeIds: ids,
            wrapperNode: {
                id: groupId,
                type: 'group',
                parentId,
                props: { transform: { x: 0, y: 0 } },
            },
            parentId,
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SELECTION_SET,
        payload: {
            ids: [groupId],
            primary: groupId,
        },
    });

    return groupId;
}
