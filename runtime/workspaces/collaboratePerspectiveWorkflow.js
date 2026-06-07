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
    review: 'Review',
    production: 'Production',
    knowledge: 'Knowledge',
    education: 'Education',
});

const ENTRY_PRIORITIES = Object.freeze({
    review: 0,
    production: 1,
    knowledge: 2,
    education: 3,
});

const CLUSTER_DEFINITIONS = Object.freeze({
    review: Object.freeze({
        id: 'review',
        label: 'Review',
        entryIds: Object.freeze(['review']),
    }),
    production: Object.freeze({
        id: 'production',
        label: 'Production',
        entryIds: Object.freeze(['production']),
    }),
    knowledge: Object.freeze({
        id: 'knowledge',
        label: 'Knowledge',
        entryIds: Object.freeze(['knowledge', 'education']),
    }),
});

const COLLABORATE_ENTRIES_BY_KIND = Object.freeze({
    [ArtifactKind.WORKFLOW]: Object.freeze(['review', 'production']),
    [ArtifactKind.STATE_MACHINE]: Object.freeze(['review', 'production']),
    [ArtifactKind.DOCUMENT]: Object.freeze(['knowledge', 'education']),
    [ArtifactKind.KNOWLEDGE_PAGE]: Object.freeze(['knowledge', 'education']),
    [ArtifactKind.COMPONENT_LIBRARY]: Object.freeze(['knowledge']),
});

function listUniverseNodes(universe, predicate) {
    return Object.values(asObject(universe?.nodes) ?? {})
        .filter((node) => node && node.id !== universe?.hubId)
        .filter(predicate)
        .sort((left, right) => String(left.label ?? left.id).localeCompare(String(right.label ?? right.id)));
}

function buildCollaborateWorkflowHref({ entryId, targetId = null }) {
    const searchParams = new URLSearchParams();
    searchParams.set('entry', entryId);
    if (targetId) searchParams.set('u', targetId);
    return `/workspace/collaborate?${searchParams.toString()}`;
}

function buildPublishWorkflowHref({ entryId, targetId = null }) {
    const searchParams = new URLSearchParams();
    searchParams.set('entry', entryId);
    if (targetId) searchParams.set('u', targetId);
    return `/workspace/publish?${searchParams.toString()}`;
}

function resolveClusterId(entryId) {
    return entryId === 'knowledge' || entryId === 'education' ? 'knowledge' : entryId;
}

export function buildCollaboratePerspectiveWorkflow({ universe = null, activeEntryId = 'review' } = {}) {
    const activeId = asNonEmptyString(activeEntryId) ?? 'review';
    const collaborateNodes = listUniverseNodes(universe, (node) => {
        const entries = COLLABORATE_ENTRIES_BY_KIND[node.kind];
        return Array.isArray(entries) && entries.length > 0;
    });

    const linkedArtifacts = collaborateNodes
        .flatMap((node) => {
            const entries = COLLABORATE_ENTRIES_BY_KIND[node.kind] ?? [];
            return entries.map((entryId) => {
                const clusterId = resolveClusterId(entryId);
                return Object.freeze({
                    targetId: node.id,
                    entryId,
                    entryLabel: ENTRY_LABELS[entryId] ?? entryId,
                    clusterId,
                    clusterLabel: CLUSTER_DEFINITIONS[clusterId]?.label ?? 'Knowledge',
                    kind: String(node.kind ?? 'document'),
                    label: asNonEmptyString(node.label) ?? node.id,
                    href: buildCollaborateWorkflowHref({ entryId, targetId: node.id }),
                    active: entryId === activeId,
                });
            });
        })
        .sort((left, right) => {
            const activeDelta = Number(right.active) - Number(left.active);
            if (activeDelta !== 0) return activeDelta;
            const priorityDelta = (ENTRY_PRIORITIES[left.entryId] ?? 999) - (ENTRY_PRIORITIES[right.entryId] ?? 999);
            if (priorityDelta !== 0) return priorityDelta;
            if (left.label !== right.label) return left.label.localeCompare(right.label);
            return left.entryId.localeCompare(right.entryId);
        });

    const summaryCounts = new Map();
    for (const item of linkedArtifacts) {
        summaryCounts.set(item.entryId, (summaryCounts.get(item.entryId) ?? 0) + 1);
    }

    const entrySummaries = Object.keys(ENTRY_LABELS)
        .filter((entryId) => summaryCounts.has(entryId))
        .map((entryId) =>
            Object.freeze({
                entryId,
                entryLabel: ENTRY_LABELS[entryId],
                count: summaryCounts.get(entryId) ?? 0,
            }),
        )
        .sort((left, right) => (ENTRY_PRIORITIES[left.entryId] ?? 999) - (ENTRY_PRIORITIES[right.entryId] ?? 999));

    const artifactClusters = Object.values(CLUSTER_DEFINITIONS)
        .map((cluster) => {
            const items = linkedArtifacts.filter((item) => item.clusterId === cluster.id);
            if (items.length === 0) return null;
            return Object.freeze({
                clusterId: cluster.id,
                clusterLabel: cluster.label,
                items: Object.freeze(items),
            });
        })
        .filter(Boolean);

    const publishSource =
        collaborateNodes.find((node) => node.kind === ArtifactKind.DOCUMENT) ??
        collaborateNodes.find((node) => node.kind === ArtifactKind.KNOWLEDGE_PAGE) ??
        collaborateNodes[0] ??
        null;

    const publishHandoff = publishSource
        ? Object.freeze({
              entryId: 'review',
              entryLabel: 'Publish Review',
              label: asNonEmptyString(publishSource.label) ?? publishSource.id,
              href: buildPublishWorkflowHref({ entryId: 'review', targetId: publishSource.id }),
          })
        : null;

    const activeArtifact = linkedArtifacts.find((item) => item.active) ?? null;
    const worldSummary = Object.freeze({
        activityLabel: ENTRY_LABELS[activeId] ?? 'Review',
        currentTaskLabel: activeArtifact?.label ?? linkedArtifacts[0]?.label ?? 'Awaiting collaboration context',
        linkedArtifactCount: linkedArtifacts.length,
        clusterCount: artifactClusters.length,
        nextArtifactLabel:
            linkedArtifacts.find((item) => item.entryId !== activeId)?.label ??
            linkedArtifacts[0]?.label ??
            null,
        publishBridgeLabel: publishHandoff?.entryLabel ?? null,
    });

    return Object.freeze({
        activeEntryId: activeId,
        linkedArtifacts: Object.freeze(linkedArtifacts),
        entrySummaries: Object.freeze(entrySummaries),
        artifactClusters: Object.freeze(artifactClusters),
        suggestedNextArtifact: linkedArtifacts.find((item) => item.entryId !== activeId) ?? linkedArtifacts[0] ?? null,
        publishHandoff,
        worldSummary,
    });
}
