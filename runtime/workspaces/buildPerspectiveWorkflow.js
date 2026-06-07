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
    application: 'Application',
    automation: 'Automation',
    logic: 'Logic',
    ai: 'AI',
    conversion: 'Conversion',
});

const ENTRY_PRIORITIES = Object.freeze({
    application: 0,
    automation: 1,
    logic: 2,
    ai: 3,
    conversion: 4,
});

const CLUSTER_DEFINITIONS = Object.freeze({
    application: Object.freeze({
        id: 'application',
        label: 'Application',
        entryIds: Object.freeze(['application']),
    }),
    automation: Object.freeze({
        id: 'automation',
        label: 'Automation',
        entryIds: Object.freeze(['automation']),
    }),
    logic: Object.freeze({
        id: 'logic',
        label: 'Logic',
        entryIds: Object.freeze(['logic']),
    }),
    ai: Object.freeze({
        id: 'ai',
        label: 'AI',
        entryIds: Object.freeze(['ai']),
    }),
    conversion: Object.freeze({
        id: 'conversion',
        label: 'Conversion',
        entryIds: Object.freeze(['conversion']),
    }),
});

const ENTRY_TO_CLUSTER_ID = Object.freeze(
    Object.fromEntries(
        Object.values(CLUSTER_DEFINITIONS).flatMap((cluster) =>
            cluster.entryIds.map((entryId) => [entryId, cluster.id]),
        ),
    ),
);

const KIND_TO_BUILD_ENTRY = Object.freeze({
    [ArtifactKind.SYSTEM_MODEL]: 'application',
    [ArtifactKind.WORKFLOW]: 'automation',
    [ArtifactKind.STATE_MACHINE]: 'logic',
    [ArtifactKind.AI_AGENT]: 'ai',
    [ArtifactKind.DOCUMENT]: 'conversion',
});

function listUniverseNodes(universe, predicate) {
    return Object.values(asObject(universe?.nodes) ?? {})
        .filter((node) => node && node.id !== universe?.hubId)
        .filter(predicate)
        .sort((left, right) => String(left.label ?? left.id).localeCompare(String(right.label ?? right.id)));
}

function buildBuildWorkflowHref({ entryId, targetId = null }) {
    const searchParams = new URLSearchParams();
    searchParams.set('entry', entryId);
    if (targetId) searchParams.set('u', targetId);
    return `/workspace/build?${searchParams.toString()}`;
}

function buildOperateWorkflowHref({ entryId, targetId = null }) {
    const searchParams = new URLSearchParams();
    searchParams.set('entry', entryId);
    if (targetId) searchParams.set('u', targetId);
    return `/workspace/operate?${searchParams.toString()}`;
}

function resolveBuildEntryForNode(node) {
    return KIND_TO_BUILD_ENTRY[node?.kind] ?? null;
}

function resolveClusterId(entryId) {
    return ENTRY_TO_CLUSTER_ID[entryId] ?? 'application';
}

export function buildBuildPerspectiveWorkflow({ universe = null, activeEntryId = 'application' } = {}) {
    const activeId = asNonEmptyString(activeEntryId) ?? 'application';
    const buildNodes = listUniverseNodes(universe, (node) => resolveBuildEntryForNode(node));

    const linkedArtifacts = buildNodes
        .map((node) => {
            const entryId = resolveBuildEntryForNode(node);
            if (!entryId) return null;
            const clusterId = resolveClusterId(entryId);
            return Object.freeze({
                targetId: node.id,
                entryId,
                entryLabel: ENTRY_LABELS[entryId] ?? entryId,
                clusterId,
                clusterLabel: CLUSTER_DEFINITIONS[clusterId]?.label ?? 'Application',
                kind: String(node.kind ?? 'workflow'),
                label: asNonEmptyString(node.label) ?? node.id,
                href: buildBuildWorkflowHref({ entryId, targetId: node.id }),
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

    const activeArtifact = linkedArtifacts.find((item) => item.active) ?? null;

    const operateNode =
        listUniverseNodes(universe, (node) => node.kind === ArtifactKind.SYSTEM_MODEL)[0] ??
        listUniverseNodes(universe, (node) => node.kind === ArtifactKind.WORKFLOW)[0] ??
        null;

    const operateHandoff = operateNode
        ? Object.freeze({
              entryId: 'systems-engineering',
              entryLabel: 'Systems Engineering',
              label: asNonEmptyString(operateNode.label) ?? operateNode.id,
              href: buildOperateWorkflowHref({ entryId: 'systems-engineering', targetId: operateNode.id }),
          })
        : null;

    const worldSummary = Object.freeze({
        activityLabel: ENTRY_LABELS[activeId] ?? 'Application',
        activeArtifactLabel: activeArtifact?.label ?? null,
        activeArtifactCount: summaryCounts.get(activeId) ?? 0,
        linkedArtifactCount: linkedArtifacts.length,
        clusterCount: artifactClusters.length,
        nextArtifactLabel: linkedArtifacts.find((item) => item.entryId !== activeId)?.label ?? linkedArtifacts[0]?.label ?? null,
        operateBridgeLabel: operateHandoff?.entryLabel ?? null,
    });

    return Object.freeze({
        activeEntryId: activeId,
        linkedArtifacts: Object.freeze(linkedArtifacts),
        entrySummaries: Object.freeze(entrySummaries),
        artifactClusters: Object.freeze(artifactClusters),
        suggestedNextArtifact: linkedArtifacts.find((item) => item.entryId !== activeId) ?? linkedArtifacts[0] ?? null,
        operateHandoff,
        worldSummary,
    });
}
