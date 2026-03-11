function getDocumentNodes(document) {
    return document?.sceneGraph?.nodes ?? document?.nodes ?? {};
}

export function copySelection(selectionIds, document) {
    const ids = Array.isArray(selectionIds) ? selectionIds.filter(Boolean) : [];
    const nodesById = getDocumentNodes(document);
    const nodes = ids.map((id) => nodesById[id]).filter(Boolean);

    return {
        nodes: structuredClone(nodes),
        rootIds: [...ids],
    };
}
