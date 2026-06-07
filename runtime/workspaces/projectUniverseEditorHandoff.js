import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

const ARTIFACT_ROUTE_MAP = Object.freeze({
    [ArtifactKind.FRAME]: Object.freeze({ perspectiveId: 'create', entryId: 'uiux' }),
    [ArtifactKind.DOCUMENT]: Object.freeze({ perspectiveId: 'create', entryId: 'document' }),
    [ArtifactKind.VIDEO]: Object.freeze({ perspectiveId: 'create', entryId: 'video' }),
    [ArtifactKind.ANIMATION]: Object.freeze({ perspectiveId: 'create', entryId: 'animation' }),
    [ArtifactKind.WORKFLOW]: Object.freeze({ perspectiveId: 'build', entryId: 'application' }),
    [ArtifactKind.STATE_MACHINE]: Object.freeze({ perspectiveId: 'build', entryId: 'logic' }),
    [ArtifactKind.KNOWLEDGE_PAGE]: Object.freeze({ perspectiveId: 'collaborate', entryId: 'knowledge' }),
    [ArtifactKind.COMPONENT_LIBRARY]: Object.freeze({ perspectiveId: 'publish', entryId: 'components' }),
    [ArtifactKind.AI_AGENT]: Object.freeze({ perspectiveId: 'build', entryId: 'ai' }),
    [ArtifactKind.SYSTEM_MODEL]: Object.freeze({ perspectiveId: 'operate', entryId: 'systems-engineering' }),
});

function resolveNodeRoute(node, currentPerspectiveId, currentEntryId) {
    const mapped = ARTIFACT_ROUTE_MAP[node?.kind] ?? null;
    return Object.freeze({
        perspectiveId: mapped?.perspectiveId ?? asNonEmptyString(currentPerspectiveId) ?? 'overview',
        entryId: mapped?.entryId ?? asNonEmptyString(currentEntryId) ?? 'uiux',
    });
}

export function resolveProjectUniverseContinuityTarget({
    universe = null,
    targetId = null,
    currentPerspectiveId = 'overview',
    currentEntryId = null,
} = {}) {
    const normalizedTargetId = asNonEmptyString(targetId);
    if (!normalizedTargetId) return null;

    const node =
        universe?.nodes && typeof universe.nodes === 'object'
            ? universe.nodes[normalizedTargetId] ?? null
            : null;

    if (node) {
        const route = resolveNodeRoute(node, currentPerspectiveId, currentEntryId);
        return Object.freeze({
            targetId: normalizedTargetId,
            perspectiveId: route.perspectiveId,
            entryId: route.entryId,
            label: asNonEmptyString(node.label) ?? normalizedTargetId,
            kind: asNonEmptyString(node.kind) ?? ArtifactKind.DOCUMENT,
        });
    }

    const group =
        universe?.groups && typeof universe.groups === 'object'
            ? universe.groups[normalizedTargetId] ?? null
            : null;
    if (group) {
        const primaryNodeId = asNonEmptyString(group?.metadata?.primaryNodeId);
        const primaryNode =
            primaryNodeId && universe?.nodes && typeof universe.nodes === 'object'
                ? universe.nodes[primaryNodeId] ?? null
                : null;
        return Object.freeze({
            targetId: normalizedTargetId,
            perspectiveId: asNonEmptyString(group.perspectiveId) ?? 'overview',
            entryId: primaryNode ? resolveNodeRoute(primaryNode, currentPerspectiveId, currentEntryId).entryId : null,
            label: asNonEmptyString(group.label) ?? normalizedTargetId,
            kind: asNonEmptyString(primaryNode?.kind),
        });
    }

    if (normalizedTargetId === asNonEmptyString(universe?.hubId)) {
        const hubNode =
            universe?.nodes && typeof universe.nodes === 'object'
                ? universe.nodes[normalizedTargetId] ?? null
                : null;
        return Object.freeze({
            targetId: normalizedTargetId,
            perspectiveId: 'overview',
            entryId: null,
            label: asNonEmptyString(hubNode?.label) ?? 'Project Hub',
            kind: asNonEmptyString(hubNode?.kind) ?? ArtifactKind.PROJECT_HUB,
        });
    }

    return null;
}

export function resolveProjectUniverseEditorHandoff({
    universe = null,
    targetId = null,
    currentPerspectiveId = 'overview',
    currentEntryId = null,
} = {}) {
    const normalizedTargetId = asNonEmptyString(targetId);
    if (!normalizedTargetId) return null;

    const node =
        universe?.nodes && typeof universe.nodes === 'object'
            ? universe.nodes[normalizedTargetId] ?? null
            : null;

    if (!node || node.id === universe?.hubId) return null;

    const route = resolveNodeRoute(node, currentPerspectiveId, currentEntryId);

    return Object.freeze({
        targetId: normalizedTargetId,
        perspectiveId: route.perspectiveId,
        entryId: route.entryId,
        label: asNonEmptyString(node.label) ?? normalizedTargetId,
        kind: asNonEmptyString(node.kind) ?? ArtifactKind.DOCUMENT,
    });
}
