import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';

const ALLOWED_UNIVERSE_KINDS = new Set([
    ArtifactKind.PROJECT_HUB,
    ArtifactKind.FRAME,
    ArtifactKind.DOCUMENT,
    ArtifactKind.VIDEO,
    ArtifactKind.ANIMATION,
    ArtifactKind.WORKFLOW,
    ArtifactKind.STATE_MACHINE,
    ArtifactKind.KNOWLEDGE_PAGE,
    ArtifactKind.COMPONENT_LIBRARY,
    ArtifactKind.AI_AGENT,
    ArtifactKind.SYSTEM_MODEL,
]);

function isFiniteNumber(value) {
    return Number.isFinite(value);
}

function normalizeRefs(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id) => typeof id === 'string' && id.trim().length > 0))]
        .map((id) => id.trim())
        .sort();
}

function normalizeNode(id, node) {
    const kind =
        typeof node?.kind === 'string' && ALLOWED_UNIVERSE_KINDS.has(node.kind)
            ? node.kind
            : ArtifactKind.DOCUMENT;

    return Object.freeze({
        id,
        kind,
        label: typeof node?.label === 'string' && node.label.trim().length > 0 ? node.label.trim() : id,
        x: isFiniteNumber(node?.x) ? Number(node.x) : 0,
        y: isFiniteNumber(node?.y) ? Number(node.y) : 0,
        refs: Object.freeze(normalizeRefs(node?.refs)),
        metadata:
            node?.metadata && typeof node.metadata === 'object' && !Array.isArray(node.metadata)
                ? Object.freeze({ ...node.metadata })
                : Object.freeze({}),
    });
}

function normalizeGroup(id, group, nodes) {
    const nodeIds = Array.isArray(group?.nodeIds)
        ? [...new Set(group.nodeIds.filter((nodeId) => typeof nodeId === 'string' && Object.prototype.hasOwnProperty.call(nodes, nodeId)))]
              .sort()
        : [];

    return Object.freeze({
        id,
        perspectiveId:
            typeof group?.perspectiveId === 'string' && group.perspectiveId.trim().length > 0
                ? group.perspectiveId.trim()
                : 'overview',
        label: typeof group?.label === 'string' && group.label.trim().length > 0 ? group.label.trim() : id,
        x: isFiniteNumber(group?.x) ? Number(group.x) : 0,
        y: isFiniteNumber(group?.y) ? Number(group.y) : 0,
        nodeIds: Object.freeze(nodeIds),
        metadata:
            group?.metadata && typeof group.metadata === 'object' && !Array.isArray(group.metadata)
                ? Object.freeze({ ...group.metadata })
                : Object.freeze({}),
    });
}

export function normalizeProjectUniverseArtifacts(universe) {
    if (!universe || typeof universe !== 'object') return null;

    const version = universe.version === 1 ? 1 : 1;
    const rawNodes = universe.nodes && typeof universe.nodes === 'object' ? universe.nodes : {};
    const nodeIds = Object.keys(rawNodes).filter((id) => typeof id === 'string' && id.trim().length > 0).sort();
    const nodes = Object.fromEntries(nodeIds.map((id) => [id, normalizeNode(id, rawNodes[id])]));
    const rawGroups = universe.groups && typeof universe.groups === 'object' ? universe.groups : {};
    const groupIds = Object.keys(rawGroups).filter((id) => typeof id === 'string' && id.trim().length > 0).sort();
    const groups = Object.fromEntries(groupIds.map((id) => [id, normalizeGroup(id, rawGroups[id], nodes)]));

    const hubId =
        typeof universe.hubId === 'string' && Object.prototype.hasOwnProperty.call(nodes, universe.hubId)
            ? universe.hubId
            : nodeIds.find((id) => nodes[id].kind === ArtifactKind.PROJECT_HUB) ?? null;

    return Object.freeze({
        version,
        hubId,
        nodes: Object.freeze(nodes),
        groups: Object.freeze(groups),
    });
}
