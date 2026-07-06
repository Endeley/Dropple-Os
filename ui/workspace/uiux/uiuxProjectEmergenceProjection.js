'use client';

import { UIUX_LANGUAGE_DICTIONARY } from './uiuxLanguageDictionary.js';

function getDefinition(type) {
    if (typeof type !== 'string' || type.trim().length === 0) return null;
    return UIUX_LANGUAGE_DICTIONARY[type] ?? null;
}

function isCreateUiUxWorld({ workspaceId = null, modeId = null } = {}) {
    return workspaceId === 'create' || workspaceId === 'uiux' || modeId === 'create' || modeId === 'uiux';
}

export function canUIUXContain(parentType, childType) {
    const parent = getDefinition(parentType);
    if (!parent) return false;
    return Array.isArray(parent.allowedChildren) && parent.allowedChildren.includes(childType);
}

export function resolveUIUXDefaultCreateParentId({
    activeToolId = null,
    selectedNode = null,
    nodesById = null,
} = {}) {
    if (typeof activeToolId !== 'string' || activeToolId.trim().length === 0) return null;
    if (!selectedNode?.id) return null;

    let candidate = selectedNode;
    const visited = new Set();

    while (candidate?.id && !visited.has(candidate.id)) {
        visited.add(candidate.id);

        if (canUIUXContain(candidate.type, activeToolId)) {
            return candidate.id;
        }

        candidate = candidate.parentId ? nodesById?.[candidate.parentId] ?? null : null;
    }

    return null;
}

export function resolveUIUXProjectEmergenceProjection({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
    selectedNode = null,
    nodesById = null,
} = {}) {
    if (!isCreateUiUxWorld({ workspaceId, modeId })) return null;
    if (Number(nodeCount) < 2) return null;
    if (!selectedNode?.id) return null;

    if (selectedNode.parentId) {
        const parentNode = nodesById?.[selectedNode.parentId] ?? null;
        if (parentNode?.id && canUIUXContain(parentNode.type, selectedNode.type)) {
            const parentDefinition = getDefinition(parentNode.type);
            const childDefinition = getDefinition(selectedNode.type);
            if (parentDefinition && childDefinition) {
                return Object.freeze({
                    parentNodeId: parentNode.id,
                    childNodeId: selectedNode.id,
                    parentType: parentNode.type,
                    childType: selectedNode.type,
                });
            }
        }
    }

    const childNode =
        Object.values(nodesById ?? {}).find(
            (node) => node?.parentId === selectedNode.id && canUIUXContain(selectedNode.type, node?.type),
        ) ?? null;
    if (!childNode?.id) return null;

    const parentDefinition = getDefinition(selectedNode.type);
    const childDefinition = getDefinition(childNode.type);
    if (!parentDefinition || !childDefinition) return null;

    return Object.freeze({
        parentNodeId: selectedNode.id,
        childNodeId: childNode.id,
        parentType: selectedNode.type,
        childType: childNode.type,
    });
}
