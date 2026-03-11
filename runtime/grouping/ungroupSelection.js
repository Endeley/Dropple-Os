import { EventTypes } from '@/core/events/eventTypes.js';

export async function ungroupSelection(groupId, dispatcher) {
    if (!groupId || !dispatcher?.dispatch || !dispatcher?.getState) return null;

    const state = dispatcher.getState();
    const node = state?.document?.sceneGraph?.nodes?.[groupId] ?? state?.nodes?.[groupId];
    if (!node || node.type !== 'group') return null;

    await dispatcher.dispatch({
        type: EventTypes.NODE_UNWRAP,
        payload: {
            nodeId: groupId,
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SELECTION_SET,
        payload: {
            ids: [...(node.children ?? [])],
            primary: node.children?.[0] ?? null,
        },
    });

    return [...(node.children ?? [])];
}
