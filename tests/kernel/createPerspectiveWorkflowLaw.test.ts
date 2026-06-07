import test from 'node:test';
import assert from 'node:assert/strict';

import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import { buildCreatePerspectiveWorkflow } from '@/runtime/workspaces/createPerspectiveWorkflow.js';

test('create perspective workflow derives deterministic linked artifact routes from project universe truth', () => {
    const universe = Object.freeze({
        hubId: 'project:hub',
        nodes: Object.freeze({
            'project:hub': Object.freeze({ id: 'project:hub', kind: ArtifactKind.PROJECT_HUB, label: 'Project Hub' }),
            'document:primary': Object.freeze({
                id: 'document:primary',
                kind: ArtifactKind.DOCUMENT,
                label: 'Primary Document',
            }),
            'frame:dispatch': Object.freeze({
                id: 'frame:dispatch',
                kind: ArtifactKind.FRAME,
                label: 'Dispatch Board',
            }),
            'animation:motion': Object.freeze({
                id: 'animation:motion',
                kind: ArtifactKind.ANIMATION,
                label: 'Motion System',
            }),
            'components:library': Object.freeze({
                id: 'components:library',
                kind: ArtifactKind.COMPONENT_LIBRARY,
                label: 'Component Library',
            }),
        }),
        groups: Object.freeze({
            'group:create': Object.freeze({
                id: 'group:create',
                perspectiveId: 'create',
                label: 'Create',
                nodeIds: Object.freeze([
                    'document:primary',
                    'frame:dispatch',
                    'animation:motion',
                    'components:library',
                ]),
            }),
        }),
    });

    const left = buildCreatePerspectiveWorkflow({ universe, activeEntryId: 'uiux' });
    const right = buildCreatePerspectiveWorkflow({ universe, activeEntryId: 'uiux' });

    assert.deepEqual(left, right);
    assert.equal(left.linkedArtifacts[0]?.targetId, 'frame:dispatch');
    assert.equal(left.linkedArtifacts[0]?.clusterId, 'interface');
    assert.equal(left.linkedArtifacts[0]?.href, '/workspace/create?entry=uiux&u=frame%3Adispatch');
    assert.equal(left.linkedArtifacts[1]?.targetId, 'components:library');
    assert.equal(left.linkedArtifacts[1]?.entryId, 'graphic');
    assert.equal(left.linkedArtifacts[1]?.clusterId, 'brand');
    assert.equal(left.linkedArtifacts[2]?.targetId, 'document:primary');
    assert.equal(left.linkedArtifacts[2]?.entryId, 'document');
    assert.equal(left.linkedArtifacts[2]?.clusterId, 'document');
    assert.equal(left.linkedArtifacts[3]?.targetId, 'animation:motion');
    assert.equal(left.linkedArtifacts[3]?.entryId, 'animation');
    assert.equal(left.linkedArtifacts[3]?.clusterId, 'motion');
    assert.deepEqual(left.entrySummaries, Object.freeze([
        Object.freeze({ entryId: 'uiux', entryLabel: 'UI / UX', count: 1 }),
        Object.freeze({ entryId: 'graphic', entryLabel: 'Graphic', count: 1 }),
        Object.freeze({ entryId: 'document', entryLabel: 'Document', count: 1 }),
        Object.freeze({ entryId: 'animation', entryLabel: 'Animation', count: 1 }),
    ]));
    assert.deepEqual(left.artifactClusters, Object.freeze([
        Object.freeze({
            clusterId: 'interface',
            clusterLabel: 'Interface',
            items: Object.freeze([left.linkedArtifacts[0]]),
        }),
        Object.freeze({
            clusterId: 'brand',
            clusterLabel: 'Brand',
            items: Object.freeze([left.linkedArtifacts[1]]),
        }),
        Object.freeze({
            clusterId: 'document',
            clusterLabel: 'Document',
            items: Object.freeze([left.linkedArtifacts[2]]),
        }),
        Object.freeze({
            clusterId: 'motion',
            clusterLabel: 'Motion',
            items: Object.freeze([left.linkedArtifacts[3]]),
        }),
    ]));
    assert.equal(left.suggestedNextArtifact?.targetId, 'components:library');
    assert.equal(left.worldSummary?.activityLabel, 'UI / UX');
    assert.equal(left.worldSummary?.currentTaskLabel, 'Dispatch Board');
    assert.equal(left.worldSummary?.linkedArtifactCount, 4);
    assert.equal(left.worldSummary?.clusterCount, 4);
    assert.equal(left.worldSummary?.nextArtifactLabel, 'Component Library');
});

test('create perspective workflow fails closed when create group or nodes are absent', () => {
    assert.deepEqual(
        buildCreatePerspectiveWorkflow({ universe: null, activeEntryId: 'document' }),
        Object.freeze({
            activeEntryId: 'document',
            linkedArtifacts: Object.freeze([]),
            entrySummaries: Object.freeze([]),
            artifactClusters: Object.freeze([]),
            suggestedNextArtifact: null,
            worldSummary: Object.freeze({
                activityLabel: 'Document',
                currentTaskLabel: 'Awaiting create context',
                linkedArtifactCount: 0,
                clusterCount: 0,
                nextArtifactLabel: null,
            }),
        }),
    );
});
