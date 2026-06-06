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

    const mapped = ARTIFACT_ROUTE_MAP[node.kind] ?? null;
    const perspectiveId = mapped?.perspectiveId ?? asNonEmptyString(currentPerspectiveId) ?? 'overview';
    const entryId = mapped?.entryId ?? asNonEmptyString(currentEntryId) ?? 'uiux';

    return Object.freeze({
        targetId: normalizedTargetId,
        perspectiveId,
        entryId,
        label: asNonEmptyString(node.label) ?? normalizedTargetId,
        kind: asNonEmptyString(node.kind) ?? ArtifactKind.DOCUMENT,
    });
}
