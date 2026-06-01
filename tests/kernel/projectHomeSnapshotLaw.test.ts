import test from 'node:test';
import assert from 'node:assert/strict';

import { buildProjectHomeSnapshot } from '@/runtime/workspaces/projectHomeSnapshot.js';

test('project home snapshot is deterministic and sorted for equivalent input', () => {
    const input = Object.freeze({
        recentProjects: Object.freeze([
            Object.freeze({ projectId: 'project.b', name: 'B', updatedAt: 2 }),
            Object.freeze({ projectId: 'project.a', name: 'A', updatedAt: 2 }),
            Object.freeze({ projectId: 'project.c', name: 'C', updatedAt: 9 }),
        ]),
        recommendedBlueprints: Object.freeze([
            Object.freeze({ id: 'bp.z', name: 'Z', description: 'z' }),
            Object.freeze({ id: 'bp.a', name: 'A', description: 'a' }),
        ]),
        continueRoute: '/workspace/create',
    });

    const left = buildProjectHomeSnapshot(input);
    const right = buildProjectHomeSnapshot(input);

    assert.deepEqual(left, right);
    assert.deepEqual(
        left.recentProjects.map((project) => project.projectId),
        ['project.c', 'project.a', 'project.b'],
    );
    assert.deepEqual(
        left.recommendedBlueprints.map((blueprint) => blueprint.id),
        ['bp.a', 'bp.z'],
    );
    assert.equal(left.continueRoute, '/workspace/create');
});

test('project home snapshot fails closed with missing/invalid fields', () => {
    const snapshot = buildProjectHomeSnapshot({
        recentProjects: [{ projectId: '', name: '' }, { projectId: 'p.ok', name: 'OK' }],
        recommendedBlueprints: [{ id: null, name: 'bad' }, { id: 'bp.ok', name: 'Okay' }],
        continueRoute: '',
    });

    assert.equal(snapshot.recentProjects.length, 1);
    assert.equal(snapshot.recommendedBlueprints.length, 1);
    assert.equal(snapshot.continueRoute, '/workspace/overview');
    assert.equal(snapshot.marketplaceRoute, '/marketplace');
});
