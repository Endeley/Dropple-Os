import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';

function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function countKeys(value) {
    return Object.keys(asObject(value) ?? {}).length;
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

function summarizeSimulation(document) {
    const simulation = asObject(document?.simulation);
    return Object.freeze({
        springChainCount: Array.isArray(simulation?.springChains) ? simulation.springChains.length : 0,
        groupCount: Array.isArray(simulation?.springChainGroups) ? simulation.springChainGroups.length : 0,
        profileCount: countKeys(simulation?.entityProfiles) + countKeys(simulation?.dampingProfiles),
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
