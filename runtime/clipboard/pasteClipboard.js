import { EventTypes } from '@/core/events/eventTypes.js';
import { generateNodeId } from '@/runtime/nodes/generateNodeId.js';

function getStateNodes(dispatcher) {
    const state = dispatcher?.getState?.() ?? null;
    return state?.document?.sceneGraph?.nodes ?? state?.nodes ?? {};
}

function remapNode(node, idMap) {
    const nextId = idMap.get(node.id);
    const mappedParentId = node.parentId ? idMap.get(node.parentId) ?? null : null;
    const mappedChildren = Array.isArray(node.children)
        ? node.children.map((id) => idMap.get(id)).filter(Boolean)
        : [];

    return {
        ...structuredClone(node),
        id: nextId,
        parentId: mappedParentId,
        children: mappedChildren,
    };
}

export async function pasteClipboard(clipboard, dispatcher) {
    if (!clipboard?.nodes?.length || !dispatcher?.dispatch) {
        return [];
    }

    const existingIds = new Set(Object.keys(getStateNodes(dispatcher)).sort());
    const idMap = new Map();

    clipboard.nodes.forEach((node) => {
        let nextId = generateNodeId(node.type || 'node');
        while (existingIds.has(nextId)) {
            nextId = generateNodeId(node.type || 'node');
        }
        existingIds.add(nextId);
        idMap.set(node.id, nextId);
    });

    const createdNodes = clipboard.nodes.map((node) => remapNode(node, idMap));

    for (const node of createdNodes) {
        await dispatcher.dispatch({
            type: EventTypes.NODE_CREATE,
            payload: { node },
        });
    }

    for (const node of createdNodes) {
        if (!node.parentId) continue;

        await dispatcher.dispatch({
            type: EventTypes.NODE_ATTACH,
            payload: {
                parentId: node.parentId,
                childId: node.id,
            },
        });
    }

    const nextRootIds = (clipboard.rootIds ?? [])
        .map((id) => idMap.get(id))
        .filter(Boolean);

    if (nextRootIds.length) {
        await dispatcher.dispatch({
            type: EventTypes.SELECTION_SET,
            payload: {
                ids: nextRootIds,
                primary: nextRootIds[0] ?? null,
            },
        });
    }

    return createdNodes;
}
