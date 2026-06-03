import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';

function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

const ENTRY_LABELS = Object.freeze({
    uiux: 'UI / UX',
    graphic: 'Graphic',
    branding: 'Branding',
    icons: 'Icons',
    document: 'Document',
    animation: 'Animation',
    video: 'Video',
    audio: 'Audio',
    podcast: 'Podcast',
});

const ENTRY_PRIORITIES = Object.freeze({
    uiux: 0,
    graphic: 1,
    branding: 2,
    icons: 3,
    document: 4,
    animation: 5,
    video: 6,
    audio: 7,
    podcast: 8,
});

const KIND_TO_CREATE_ENTRY = Object.freeze({
    [ArtifactKind.FRAME]: 'uiux',
    [ArtifactKind.DOCUMENT]: 'document',
    [ArtifactKind.ANIMATION]: 'animation',
    [ArtifactKind.VIDEO]: 'video',
    [ArtifactKind.COMPONENT_LIBRARY]: 'graphic',
});

function resolveCreateEntryForNode(node) {
    if (!node || typeof node !== 'object') return null;
    const preferred = KIND_TO_CREATE_ENTRY[node.kind] ?? null;
    if (preferred) return preferred;
    return null;
}

function buildCreateWorkflowHref({ entryId, targetId }) {
    const searchParams = new URLSearchParams();
    searchParams.set('entry', entryId);
    searchParams.set('u', targetId);
    return `/workspace/create?${searchParams.toString()}`;
}

export function buildCreatePerspectiveWorkflow({ universe = null, activeEntryId = 'uiux' } = {}) {
    const groups = asObject(universe?.groups);
    const nodes = asObject(universe?.nodes);
    const createGroup = groups?.['group:create'] ?? null;
    const activeId = asNonEmptyString(activeEntryId) ?? 'uiux';
    if (!createGroup || !nodes) {
        return Object.freeze({
            activeEntryId: activeId,
            linkedArtifacts: Object.freeze([]),
            entrySummaries: Object.freeze([]),
        });
    }

    const linkedArtifacts = createGroup.nodeIds
        .map((nodeId) => nodes[nodeId] ?? null)
        .filter(Boolean)
        .map((node) => {
            const entryId = resolveCreateEntryForNode(node);
            if (!entryId) return null;
            return Object.freeze({
                targetId: node.id,
                entryId,
                entryLabel: ENTRY_LABELS[entryId] ?? entryId,
                kind: node.kind,
                label: asNonEmptyString(node.label) ?? node.id,
                href: buildCreateWorkflowHref({ entryId, targetId: node.id }),
                active: entryId === activeId,
            });
        })
        .filter(Boolean)
        .sort((left, right) => {
            const activeDelta = Number(right.active) - Number(left.active);
            if (activeDelta !== 0) return activeDelta;
            const priorityDelta = (ENTRY_PRIORITIES[left.entryId] ?? 999) - (ENTRY_PRIORITIES[right.entryId] ?? 999);
            if (priorityDelta !== 0) return priorityDelta;
            return left.label.localeCompare(right.label);
        });

    const summaryCounts = new Map();
    for (const item of linkedArtifacts) {
        summaryCounts.set(item.entryId, (summaryCounts.get(item.entryId) ?? 0) + 1);
    }

    const entrySummaries = [...summaryCounts.entries()]
        .map(([entryId, count]) =>
            Object.freeze({
                entryId,
                entryLabel: ENTRY_LABELS[entryId] ?? entryId,
                count,
            }),
        )
        .sort((left, right) => (ENTRY_PRIORITIES[left.entryId] ?? 999) - (ENTRY_PRIORITIES[right.entryId] ?? 999));

    return Object.freeze({
        activeEntryId: activeId,
        linkedArtifacts: Object.freeze(linkedArtifacts),
        entrySummaries: Object.freeze(entrySummaries),
    });
}
