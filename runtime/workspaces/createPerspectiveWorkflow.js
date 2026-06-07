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

const CLUSTER_DEFINITIONS = Object.freeze({
    interface: Object.freeze({
        id: 'interface',
        label: 'Interface',
        entryIds: Object.freeze(['uiux']),
    }),
    brand: Object.freeze({
        id: 'brand',
        label: 'Brand',
        entryIds: Object.freeze(['graphic', 'branding', 'icons']),
    }),
    document: Object.freeze({
        id: 'document',
        label: 'Document',
        entryIds: Object.freeze(['document']),
    }),
    motion: Object.freeze({
        id: 'motion',
        label: 'Motion',
        entryIds: Object.freeze(['animation']),
    }),
    media: Object.freeze({
        id: 'media',
        label: 'Media',
        entryIds: Object.freeze(['video', 'audio', 'podcast']),
    }),
});

const ENTRY_TO_CLUSTER_ID = Object.freeze(
    Object.fromEntries(
        Object.values(CLUSTER_DEFINITIONS).flatMap((cluster) =>
            cluster.entryIds.map((entryId) => [entryId, cluster.id]),
        ),
    ),
);

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

function resolveCreateClusterId(entryId) {
    return ENTRY_TO_CLUSTER_ID[entryId] ?? 'document';
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
            artifactClusters: Object.freeze([]),
            suggestedNextArtifact: null,
            worldSummary: Object.freeze({
                activityLabel: ENTRY_LABELS[activeId] ?? 'UI / UX',
                currentTaskLabel: 'Awaiting create context',
                linkedArtifactCount: 0,
                clusterCount: 0,
                nextArtifactLabel: null,
            }),
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
                clusterId: resolveCreateClusterId(entryId),
                clusterLabel: CLUSTER_DEFINITIONS[resolveCreateClusterId(entryId)]?.label ?? 'Document',
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

    const clusterBuckets = new Map();
    for (const item of linkedArtifacts) {
        const current = clusterBuckets.get(item.clusterId) ?? {
            clusterId: item.clusterId,
            clusterLabel: item.clusterLabel,
            items: [],
        };
        clusterBuckets.set(
            item.clusterId,
            Object.freeze({
                ...current,
                items: [...current.items, item],
            }),
        );
    }

    const artifactClusters = Object.values(CLUSTER_DEFINITIONS)
        .map((cluster) => clusterBuckets.get(cluster.id) ?? null)
        .filter(Boolean)
        .map((cluster) =>
            Object.freeze({
                clusterId: cluster.clusterId,
                clusterLabel: cluster.clusterLabel,
                items: Object.freeze([...cluster.items]),
            }),
        );

    const suggestedNextArtifact = linkedArtifacts.find((item) => item.entryId !== activeId) ?? linkedArtifacts[0] ?? null;
    const activeArtifact = linkedArtifacts.find((item) => item.active) ?? null;
    const worldSummary = Object.freeze({
        activityLabel: ENTRY_LABELS[activeId] ?? 'UI / UX',
        currentTaskLabel: activeArtifact?.label ?? linkedArtifacts[0]?.label ?? 'Awaiting create context',
        linkedArtifactCount: linkedArtifacts.length,
        clusterCount: artifactClusters.length,
        nextArtifactLabel: suggestedNextArtifact?.label ?? null,
    });

    return Object.freeze({
        activeEntryId: activeId,
        linkedArtifacts: Object.freeze(linkedArtifacts),
        entrySummaries: Object.freeze(entrySummaries),
        artifactClusters: Object.freeze(artifactClusters),
        suggestedNextArtifact,
        worldSummary,
    });
}
