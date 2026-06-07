import test from 'node:test';
import assert from 'node:assert/strict';

import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import { buildCollaboratePerspectiveWorkflow } from '@/runtime/workspaces/collaboratePerspectiveWorkflow.js';

test('collaborate perspective workflow derives deterministic linked artifact routes and publish handoff from project universe truth', () => {
    const universe = Object.freeze({
        hubId: 'project:hub',
        nodes: Object.freeze({
            'project:hub': Object.freeze({ id: 'project:hub', kind: ArtifactKind.PROJECT_HUB, label: 'Hub' }),
            'document:primary': Object.freeze({ id: 'document:primary', kind: ArtifactKind.DOCUMENT, label: 'Primary Document' }),
            'workflow:graph:review': Object.freeze({ id: 'workflow:graph:review', kind: ArtifactKind.WORKFLOW, label: 'Review Workflow' }),
            'state-machine:production': Object.freeze({ id: 'state-machine:production', kind: ArtifactKind.STATE_MACHINE, label: 'Production Machine' }),
            'knowledge:faq': Object.freeze({ id: 'knowledge:faq', kind: ArtifactKind.KNOWLEDGE_PAGE, label: 'FAQ' }),
        }),
    });

    const left = buildCollaboratePerspectiveWorkflow({ universe, activeEntryId: 'review' });
    const right = buildCollaboratePerspectiveWorkflow({ universe, activeEntryId: 'review' });

    assert.deepEqual(left, right);
    assert.equal(left.linkedArtifacts[0]?.entryId, 'review');
    assert.equal(left.linkedArtifacts[1]?.entryId, 'review');
    assert.equal(left.linkedArtifacts[2]?.entryId, 'production');
    assert.equal(left.entrySummaries[0]?.entryId, 'review');
    assert.equal(left.entrySummaries[1]?.entryId, 'production');
    assert.equal(left.entrySummaries[2]?.entryId, 'knowledge');
    assert.equal(left.entrySummaries[3]?.entryId, 'education');
    assert.equal(left.publishHandoff?.entryId, 'review');
    assert.equal(left.publishHandoff?.href, '/workspace/publish?entry=review&u=document%3Aprimary');
    assert.equal(left.worldSummary?.activityLabel, 'Review');
    assert.equal(left.worldSummary?.currentTaskLabel, 'Production Machine');
    assert.equal(left.worldSummary?.linkedArtifactCount, 8);
    assert.equal(left.worldSummary?.clusterCount, 3);
    assert.equal(left.worldSummary?.nextArtifactLabel, 'Production Machine');
    assert.equal(left.worldSummary?.publishBridgeLabel, 'Publish Review');
});

test('collaborate perspective workflow fails closed with empty universe', () => {
    assert.deepEqual(
        buildCollaboratePerspectiveWorkflow({ universe: null, activeEntryId: 'knowledge' }),
        Object.freeze({
            activeEntryId: 'knowledge',
            linkedArtifacts: Object.freeze([]),
            entrySummaries: Object.freeze([]),
            artifactClusters: Object.freeze([]),
            suggestedNextArtifact: null,
            publishHandoff: null,
            worldSummary: Object.freeze({
                activityLabel: 'Knowledge',
                currentTaskLabel: 'Awaiting collaboration context',
                linkedArtifactCount: 0,
                clusterCount: 0,
                nextArtifactLabel: null,
                publishBridgeLabel: null,
            }),
        }),
    );
});
