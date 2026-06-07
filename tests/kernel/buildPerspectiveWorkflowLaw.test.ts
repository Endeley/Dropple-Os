import test from 'node:test';
import assert from 'node:assert/strict';

import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import { buildBuildPerspectiveWorkflow } from '@/runtime/workspaces/buildPerspectiveWorkflow.js';

test('build perspective workflow derives deterministic linked artifact routes and operate handoff from project universe truth', () => {
    const universe = Object.freeze({
        hubId: 'project:hub',
        nodes: Object.freeze({
            'project:hub': Object.freeze({ id: 'project:hub', kind: ArtifactKind.PROJECT_HUB, label: 'Hub' }),
            'system:model': Object.freeze({ id: 'system:model', kind: ArtifactKind.SYSTEM_MODEL, label: 'System Model' }),
            'workflow:graph:routing': Object.freeze({ id: 'workflow:graph:routing', kind: ArtifactKind.WORKFLOW, label: 'Routing Workflow' }),
            'state-machine:fulfillment': Object.freeze({ id: 'state-machine:fulfillment', kind: ArtifactKind.STATE_MACHINE, label: 'Fulfillment Machine' }),
            'document:primary': Object.freeze({ id: 'document:primary', kind: ArtifactKind.DOCUMENT, label: 'Primary Document' }),
        }),
    });

    const left = buildBuildPerspectiveWorkflow({ universe, activeEntryId: 'application' });
    const right = buildBuildPerspectiveWorkflow({ universe, activeEntryId: 'application' });

    assert.deepEqual(left, right);
    assert.equal(left.linkedArtifacts[0]?.entryId, 'application');
    assert.equal(left.linkedArtifacts[1]?.entryId, 'automation');
    assert.equal(left.linkedArtifacts[2]?.entryId, 'logic');
    assert.equal(left.linkedArtifacts[3]?.entryId, 'conversion');
    assert.deepEqual(left.entrySummaries, Object.freeze([
        Object.freeze({ entryId: 'application', entryLabel: 'Application', count: 1 }),
        Object.freeze({ entryId: 'automation', entryLabel: 'Automation', count: 1 }),
        Object.freeze({ entryId: 'logic', entryLabel: 'Logic', count: 1 }),
        Object.freeze({ entryId: 'conversion', entryLabel: 'Conversion', count: 1 }),
    ]));
    assert.equal(left.operateHandoff?.entryId, 'systems-engineering');
    assert.equal(left.operateHandoff?.href, '/workspace/operate?entry=systems-engineering&u=system%3Amodel');
    assert.deepEqual(
        left.worldSummary,
        Object.freeze({
            activityLabel: 'Application',
            activeArtifactLabel: 'System Model',
            activeArtifactCount: 1,
            linkedArtifactCount: 4,
            clusterCount: 4,
            nextArtifactLabel: 'Routing Workflow',
            operateBridgeLabel: 'Systems Engineering',
        }),
    );
});

test('build perspective workflow fails closed with empty universe', () => {
    assert.deepEqual(
        buildBuildPerspectiveWorkflow({ universe: null, activeEntryId: 'automation' }),
        Object.freeze({
            activeEntryId: 'automation',
            linkedArtifacts: Object.freeze([]),
            entrySummaries: Object.freeze([]),
            artifactClusters: Object.freeze([]),
            suggestedNextArtifact: null,
            operateHandoff: null,
            worldSummary: Object.freeze({
                activityLabel: 'Automation',
                activeArtifactLabel: null,
                activeArtifactCount: 0,
                linkedArtifactCount: 0,
                clusterCount: 0,
                nextArtifactLabel: null,
                operateBridgeLabel: null,
            }),
        }),
    );
});
