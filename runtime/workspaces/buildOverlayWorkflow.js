import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import { resolveOperateAssistantActionLabels } from '@/runtime/workspaces/operateAssistantActionLabels.js';

function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function countKeys(value) {
    return Object.keys(asObject(value) ?? {}).length;
}

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function listUniverseNodes(universe, predicate) {
    return Object.values(asObject(universe?.nodes) ?? {})
        .filter((node) => node && node.id !== universe?.hubId)
        .filter(predicate)
        .sort((left, right) => String(left.label ?? left.id).localeCompare(String(right.label ?? right.id)));
}

function buildOverlayHref(entryId, targetId = null) {
    const searchParams = new URLSearchParams();
    searchParams.set('entry', entryId);
    if (targetId) searchParams.set('u', targetId);
    return `/workspace/operate?${searchParams.toString()}`;
}

function summarizeOperateEntryLabel(entryId) {
    const labels = {
        automation: 'Automation',
        'systems-engineering': 'Systems Engineering',
        'enterprise-operations': 'Enterprise Operations',
        production: 'Production',
        governance: 'Governance',
    };
    return labels[entryId] ?? 'Operate';
}

function buildOperateAssistantGuidance({
    activeEntryId,
    activeSummary,
    activeArtifact,
    suggestedNextArtifact,
}) {
    const assistantActions = resolveOperateAssistantActionLabels(activeEntryId);
    const currentTaskLabel = activeSummary?.currentTaskLabel ?? 'current operate context';
    const activityLabel = activeSummary?.activityLabel ?? summarizeOperateEntryLabel(activeEntryId);
    const activeArtifactLabel = activeArtifact?.label ?? currentTaskLabel;
    const nextTargetLabel = suggestedNextArtifact?.label ?? null;
    const nextEntryLabel = suggestedNextArtifact?.entryLabel ?? null;

    const assistantSummary = nextTargetLabel
        ? `${assistantActions.assistantLabel} is guiding ${activityLabel} toward ${nextTargetLabel}.`
        : `${assistantActions.assistantLabel} is ready to guide ${activityLabel}.`;

    const nextGuidanceLabel = nextTargetLabel
        ? `Continue from ${activeArtifactLabel} into ${nextEntryLabel} via ${nextTargetLabel}.`
        : `Keep ${activityLabel} anchored on ${activeArtifactLabel}.`;

    const systemGuidanceLabel =
        activeEntryId === 'systems-engineering'
            ? 'Keep system models, controls, and simulations aligned before surfacing downstream operations.'
            : activeEntryId === 'enterprise-operations'
              ? 'Carry process changes back into system models so enterprise operations stay grounded in project reality.'
              : activeEntryId === 'production'
                ? 'Use production workflows to verify operate intent before shifting into enterprise control.'
                : activeEntryId === 'governance'
                  ? 'Use governance to keep operating rules legible before widening context.'
                  : 'Use automation signals to keep the operating world connected to downstream systems and processes.';

    return Object.freeze({
        assistantLabel: assistantActions.assistantLabel,
        recommendLabel: assistantActions.recommendLabel,
        generateLabel: assistantActions.generateLabel,
        explainLabel: assistantActions.explainLabel,
        assistantSummary,
        nextGuidanceLabel,
        systemGuidanceLabel,
    });
}

const ENTRY_PRIORITIES = Object.freeze({
    automation: 0,
    'systems-engineering': 1,
    'enterprise-operations': 2,
    production: 3,
    governance: 4,
});

const CLUSTER_DEFINITIONS = Object.freeze({
    automation: Object.freeze({
        id: 'automation',
        label: 'Automation',
        entryIds: Object.freeze(['automation', 'production']),
    }),
    systems: Object.freeze({
        id: 'systems',
        label: 'Systems',
        entryIds: Object.freeze(['systems-engineering']),
    }),
    operations: Object.freeze({
        id: 'operations',
        label: 'Operations',
        entryIds: Object.freeze(['enterprise-operations', 'governance']),
    }),
});

const ENTRY_TO_CLUSTER_ID = Object.freeze(
    Object.fromEntries(
        Object.values(CLUSTER_DEFINITIONS).flatMap((cluster) =>
            cluster.entryIds.map((entryId) => [entryId, cluster.id]),
        ),
    ),
);

const OPERATE_ENTRIES_BY_KIND = Object.freeze({
    [ArtifactKind.WORKFLOW]: Object.freeze(['automation', 'systems-engineering', 'enterprise-operations', 'production']),
    [ArtifactKind.STATE_MACHINE]: Object.freeze(['automation', 'systems-engineering', 'production']),
    [ArtifactKind.SYSTEM_MODEL]: Object.freeze(['systems-engineering', 'enterprise-operations', 'governance']),
    [ArtifactKind.DOCUMENT]: Object.freeze(['systems-engineering', 'governance']),
});

function resolveClusterId(entryId) {
    return ENTRY_TO_CLUSTER_ID[entryId] ?? 'operations';
}

function summarizeSimulation(document) {
    const simulation = asObject(document?.simulation);
    return Object.freeze({
        springChainCount: Array.isArray(simulation?.springChains) ? simulation.springChains.length : 0,
        groupCount: Array.isArray(simulation?.springChainGroups) ? simulation.springChainGroups.length : 0,
        profileCount: countKeys(simulation?.entityProfiles) + countKeys(simulation?.dampingProfiles),
    });
}

function buildOperateItem({ node, entryId, activeEntryId }) {
    const clusterId = resolveClusterId(entryId);
    return Object.freeze({
        targetId: node.id,
        entryId,
        entryLabel: summarizeOperateEntryLabel(entryId),
        clusterId,
        clusterLabel: CLUSTER_DEFINITIONS[clusterId]?.label ?? 'Operations',
        kind: String(node.kind ?? 'document'),
        label: String(node.label ?? node.id),
        href: buildOverlayHref(entryId, node.id),
        active: entryId === activeEntryId,
    });
}

export function buildSystemsEngineeringOverlayModel({ document = null, universe = null } = {}) {
    const workflowNodes = listUniverseNodes(
        universe,
        (node) => node.kind === ArtifactKind.WORKFLOW || node.kind === ArtifactKind.STATE_MACHINE,
    ).map((node) =>
        Object.freeze({
            id: node.id,
            label: String(node.label ?? node.id),
            kind: String(node.kind ?? 'workflow'),
            href: buildOverlayHref('systems-engineering', node.id),
        }),
    );

    const systemNodes = listUniverseNodes(
        universe,
        (node) => node.kind === ArtifactKind.SYSTEM_MODEL || node.kind === ArtifactKind.DOCUMENT,
    ).map((node) =>
        Object.freeze({
            id: node.id,
            label: String(node.label ?? node.id),
            kind: String(node.kind ?? 'document'),
            href: buildOverlayHref('systems-engineering', node.id),
        }),
    );

    const simulation = summarizeSimulation(document);

    return Object.freeze({
        graphCount: countKeys(document?.graphs),
        controlCount: countKeys(asObject(document?.stateMachines)?.machines),
        dataflowCount: countKeys(asObject(document?.app)?.flows) + countKeys(document?.variables) + countKeys(document?.bindings),
        simulation,
        workflowNodes: Object.freeze(workflowNodes),
        systemNodes: Object.freeze(systemNodes),
        suggestedHref: workflowNodes[0]?.href ?? systemNodes[0]?.href ?? buildOverlayHref('systems-engineering'),
    });
}

export function buildEnterpriseOperationsOverlayModel({ document = null, universe = null } = {}) {
    const processNodes = listUniverseNodes(
        universe,
        (node) => node.kind === ArtifactKind.WORKFLOW || node.kind === ArtifactKind.SYSTEM_MODEL,
    ).map((node) =>
        Object.freeze({
            id: node.id,
            label: String(node.label ?? node.id),
            kind: String(node.kind ?? 'workflow'),
            href: buildOverlayHref('enterprise-operations', node.id),
        }),
    );

    return Object.freeze({
        processCount: countKeys(document?.graphs) + countKeys(asObject(document?.app)?.flows),
        automationCount: countKeys(asObject(document?.app)?.flows) + countKeys(asObject(document?.stateMachines)?.machines),
        datasourceCount: countKeys(document?.variables) + countKeys(document?.bindings),
        roleCount: 0,
        processNodes: Object.freeze(processNodes),
        suggestedHref: processNodes[0]?.href ?? buildOverlayHref('enterprise-operations'),
    });
}

export function buildOperatePerspectiveWorkflow({ entryId = 'automation', document = null, universe = null } = {}) {
    const activeEntryId = asNonEmptyString(entryId)?.toLowerCase() ?? 'automation';
    const operateNodes = listUniverseNodes(universe, (node) => {
        const entries = OPERATE_ENTRIES_BY_KIND[node.kind];
        return Array.isArray(entries) && entries.length > 0;
    });

    const linkedArtifacts = operateNodes
        .flatMap((node) => {
            const entries = OPERATE_ENTRIES_BY_KIND[node.kind] ?? [];
            return entries.map((candidateEntryId) =>
                buildOperateItem({
                    node,
                    entryId: candidateEntryId,
                    activeEntryId,
                }),
            );
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

    const entrySummaries = Object.keys(ENTRY_PRIORITIES)
        .filter((candidateEntryId) => summaryCounts.has(candidateEntryId))
        .map((candidateEntryId) =>
            Object.freeze({
                entryId: candidateEntryId,
                entryLabel: summarizeOperateEntryLabel(candidateEntryId),
                count: summaryCounts.get(candidateEntryId) ?? 0,
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
    const suggestedNextArtifact = linkedArtifacts.find((item) => item.entryId !== activeEntryId) ?? linkedArtifacts[0] ?? null;
    const activeSummary = buildOperatePerspectiveWorldSummary({ entryId: activeEntryId, document, universe });
    const assistantGuidance = buildOperateAssistantGuidance({
        activeEntryId,
        activeSummary,
        activeArtifact,
        suggestedNextArtifact,
    });

    const worldSummary = Object.freeze({
        ...activeSummary,
        linkedArtifactCount: linkedArtifacts.length,
        clusterCount: artifactClusters.length,
        nextTargetLabel: suggestedNextArtifact?.label ?? null,
        assistantSummary: assistantGuidance.assistantSummary,
    });

    return Object.freeze({
        activeEntryId,
        linkedArtifacts: Object.freeze(linkedArtifacts),
        entrySummaries: Object.freeze(entrySummaries),
        artifactClusters: Object.freeze(artifactClusters),
        suggestedNextArtifact,
        assistantGuidance,
        worldSummary,
    });
}

export function buildOperatePerspectiveWorldSummary({ entryId = 'automation', document = null, universe = null } = {}) {
    const normalizedEntryId = String(entryId ?? 'automation').trim().toLowerCase() || 'automation';

    if (normalizedEntryId === 'systems-engineering') {
        const model = buildSystemsEngineeringOverlayModel({ document, universe });
        return Object.freeze({
            activityLabel: 'Systems Engineering',
            currentTaskLabel: model.workflowNodes[0]?.label ?? model.systemNodes[0]?.label ?? 'Awaiting system model',
            linkedContextCount: model.workflowNodes.length + model.systemNodes.length,
            summaryLabel: `${model.graphCount} graphs · ${model.controlCount} controls · ${model.dataflowCount} signals`,
            bridgeLabel: 'Operate / Systems Engineering',
        });
    }

    if (normalizedEntryId === 'enterprise-operations') {
        const model = buildEnterpriseOperationsOverlayModel({ document, universe });
        return Object.freeze({
            activityLabel: 'Enterprise Operations',
            currentTaskLabel: model.processNodes[0]?.label ?? 'Awaiting process model',
            linkedContextCount: model.processNodes.length,
            summaryLabel: `${model.processCount} processes · ${model.automationCount} automation paths · ${model.datasourceCount} data sources`,
            bridgeLabel: 'Operate / Enterprise Operations',
        });
    }

    const workflowCount = countKeys(asObject(document?.app)?.flows) + countKeys(asObject(document?.stateMachines)?.machines);
    const signalCount = countKeys(document?.variables) + countKeys(document?.bindings);

    return Object.freeze({
        activityLabel: summarizeOperateEntryLabel(normalizedEntryId),
        currentTaskLabel: workflowCount > 0 ? 'Operate active workflows' : 'Awaiting operate context',
        linkedContextCount: workflowCount,
        summaryLabel: `${workflowCount} workflows · ${signalCount} signals`,
        bridgeLabel: `Operate / ${summarizeOperateEntryLabel(normalizedEntryId)}`,
    });
}
