import test from 'node:test';
import assert from 'node:assert/strict';

import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import {
    buildEnterpriseOperationsOverlayModel,
    buildOperatePerspectiveWorldSummary,
    buildSystemsEngineeringOverlayModel,
} from '@/runtime/workspaces/buildOverlayWorkflow.js';

test('systems engineering overlay model is deterministic and derives canonical workflow/system summaries', () => {
    const document = {
        graphs: { architecture: {}, routing: {} },
        app: { flows: { dispatchApproval: {}, escalation: {} } },
        stateMachines: { machines: { fulfillment: {}, safety: {} } },
        variables: { region: {}, fleet: {} },
        bindings: { regionBinding: {} },
        simulation: {
            springChains: [{ id: 'a' }],
            springChainGroups: [{ id: 'g' }],
            entityProfiles: { drone: {} },
            dampingProfiles: { soft: {} },
        },
    };
    const universe = {
        hubId: 'project:hub',
        nodes: {
            'project:hub': { id: 'project:hub', kind: ArtifactKind.PROJECT_HUB, label: 'Hub' },
            'workflow:graph:architecture': { id: 'workflow:graph:architecture', kind: ArtifactKind.WORKFLOW, label: 'Architecture' },
            'state-machine:fulfillment': { id: 'state-machine:fulfillment', kind: ArtifactKind.STATE_MACHINE, label: 'Fulfillment' },
            'system:model': { id: 'system:model', kind: ArtifactKind.SYSTEM_MODEL, label: 'System Model' },
            'document:primary': { id: 'document:primary', kind: ArtifactKind.DOCUMENT, label: 'Primary Document' },
        },
    };

    const left = buildSystemsEngineeringOverlayModel({ document, universe });
    const right = buildSystemsEngineeringOverlayModel({ document, universe });

    assert.deepEqual(left, right);
    assert.equal(left.graphCount, 2);
    assert.equal(left.controlCount, 2);
    assert.equal(left.dataflowCount, 5);
    assert.deepEqual(left.simulation, Object.freeze({
        springChainCount: 1,
        groupCount: 1,
        profileCount: 2,
    }));
    assert.equal(left.workflowNodes[0]?.href, '/workspace/operate?entry=systems-engineering&u=workflow%3Agraph%3Aarchitecture');
    assert.equal(left.systemNodes[0]?.href, '/workspace/operate?entry=systems-engineering&u=document%3Aprimary');
});

test('enterprise operations overlay model is deterministic and fail-closed', () => {
    const document = {
        graphs: { logistics: {} },
        app: { flows: { assignDriver: {} } },
        stateMachines: { machines: { dispatch: {} } },
        variables: { warehouse: {} },
        bindings: {},
    };
    const universe = {
        hubId: 'project:hub',
        nodes: {
            'project:hub': { id: 'project:hub', kind: ArtifactKind.PROJECT_HUB, label: 'Hub' },
            'workflow:flow:assignDriver': { id: 'workflow:flow:assignDriver', kind: ArtifactKind.WORKFLOW, label: 'Assign Driver' },
            'system:model': { id: 'system:model', kind: ArtifactKind.SYSTEM_MODEL, label: 'System Model' },
        },
    };

    const result = buildEnterpriseOperationsOverlayModel({ document, universe });

    assert.equal(result.processCount, 2);
    assert.equal(result.automationCount, 2);
    assert.equal(result.datasourceCount, 1);
    assert.equal(result.roleCount, 0);
    assert.equal(result.processNodes[0]?.href, '/workspace/operate?entry=enterprise-operations&u=workflow%3Aflow%3AassignDriver');
    assert.equal(
        buildEnterpriseOperationsOverlayModel({ document: null, universe: null }).suggestedHref,
        '/workspace/operate?entry=enterprise-operations',
    );
});

test('operate perspective world summary is deterministic and entry-aware', () => {
    const document = {
        graphs: { logistics: {} },
        app: { flows: { assignDriver: {} } },
        stateMachines: { machines: { dispatch: {} } },
        variables: { warehouse: {} },
        bindings: {},
    };
    const universe = {
        hubId: 'project:hub',
        nodes: {
            'project:hub': { id: 'project:hub', kind: ArtifactKind.PROJECT_HUB, label: 'Hub' },
            'workflow:graph:architecture': { id: 'workflow:graph:architecture', kind: ArtifactKind.WORKFLOW, label: 'Architecture' },
            'state-machine:dispatch': { id: 'state-machine:dispatch', kind: ArtifactKind.STATE_MACHINE, label: 'Dispatch' },
            'system:model': { id: 'system:model', kind: ArtifactKind.SYSTEM_MODEL, label: 'System Model' },
        },
    };

    const left = buildOperatePerspectiveWorldSummary({ entryId: 'systems-engineering', document, universe });
    const right = buildOperatePerspectiveWorldSummary({ entryId: 'systems-engineering', document, universe });

    assert.deepEqual(left, right);
    assert.deepEqual(
        left,
        Object.freeze({
            activityLabel: 'Systems Engineering',
            currentTaskLabel: 'Architecture',
            linkedContextCount: 3,
            summaryLabel: '1 graphs · 1 controls · 2 signals',
            bridgeLabel: 'Operate / Systems Engineering',
        }),
    );

    assert.deepEqual(
        buildOperatePerspectiveWorldSummary({ entryId: 'enterprise-operations', document, universe }),
        Object.freeze({
            activityLabel: 'Enterprise Operations',
            currentTaskLabel: 'Architecture',
            linkedContextCount: 2,
            summaryLabel: '2 processes · 2 automation paths · 1 data sources',
            bridgeLabel: 'Operate / Enterprise Operations',
        }),
    );
});
