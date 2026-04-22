import {
    appendTokenVersion,
    cloneVersionEntry,
    detectCycles,
    isAncestorVersion,
    normalizeParentVersionIds,
    resolveActiveVersionHead,
    rollbackTokenVersion,
    topologicalOrderVersions,
    validateMergeLegality,
    validateVersionGraph,
} from './tokenVersionGraph.js';

export {
    appendTokenVersion,
    cloneVersionEntry,
    detectCycles,
    isAncestorVersion,
    normalizeParentVersionIds,
    resolveActiveVersionHead,
    rollbackTokenVersion,
    topologicalOrderVersions,
    validateMergeLegality,
    validateVersionGraph,
};

export function listTokenVersions(tokenVersions) {
    const entries = tokenVersions?.entries ?? {};
    const order = Array.isArray(tokenVersions?.order) ? tokenVersions.order : [];

    return order.map((id) => entries[id]).filter(Boolean);
}

export function canRollbackToTokenVersion(tokenVersions, versionId) {
    if (typeof versionId !== 'string' || versionId.length === 0) {
        return false;
    }

    return Boolean(tokenVersions?.entries?.[versionId]);
}

export function wouldCreateVersionCycle(entries, versionId, parentId) {
    const parentVersionIds =
        typeof parentId === 'string' && parentId.length > 0 ? [parentId] : [];

    return detectCycles({
        entries: {
            ...(entries ?? {}),
            [versionId]: {
                id: versionId,
                parentVersionIds,
            },
        },
        order: Object.keys(entries ?? {}).concat(versionId),
        activeVersionId: null,
    });
}
