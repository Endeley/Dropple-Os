import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildProjectUniverseNavigatorItems,
    buildProjectUniverseOrientation,
    normalizeProjectUniverseNavigatorQuery,
    resolveProjectUniverseFocusTarget,
} from '@/runtime/workspaces/projectUniverseNavigation.js';

test('project universe navigator query normalization is deterministic and fail-closed', () => {
    assert.equal(normalizeProjectUniverseNavigatorQuery('  Dispatch  '), 'Dispatch');
    assert.equal(normalizeProjectUniverseNavigatorQuery(''), '');
    assert.equal(normalizeProjectUniverseNavigatorQuery(null), '');
});

test('project universe navigator items are deterministic and searchable', () => {
    const universe = Object.freeze({
        hubId: 'project:hub',
        nodes: Object.freeze({
            'project:hub': Object.freeze({ id: 'project:hub', label: 'Hub', x: 0, y: 0, kind: 'project-hub' }),
            'frame:dispatch': Object.freeze({ id: 'frame:dispatch', label: 'Dispatch Board', x: 10, y: 12, kind: 'frame' }),
            'system:model': Object.freeze({ id: 'system:model', label: 'System Model', x: 20, y: 24, kind: 'system-model' }),
        }),
        groups: Object.freeze({
            'group:create': Object.freeze({
                id: 'group:create',
                perspectiveId: 'create',
                label: 'Create',
                x: -100,
                y: -80,
                nodeIds: Object.freeze(['frame:dispatch']),
                metadata: Object.freeze({
                    primaryNodeLabel: 'Dispatch Board',
                }),
            }),
            'group:operate': Object.freeze({
                id: 'group:operate',
                perspectiveId: 'operate',
                label: 'Operate',
                x: 100,
                y: 80,
                nodeIds: Object.freeze(['system:model']),
                metadata: Object.freeze({
                    primaryNodeLabel: 'System Model',
                }),
            }),
        }),
    });

    const left = buildProjectUniverseNavigatorItems({ universe, query: 'dispatch' });
    const right = buildProjectUniverseNavigatorItems({ universe, query: 'dispatch' });

    assert.deepEqual(left, right);
    assert.equal(left.length, 2);
    assert.equal(left[0].targetType, 'group');
    assert.equal(left[0].label, 'Create');
    assert.equal(left[1].targetType, 'node');
    assert.equal(left[1].label, 'Dispatch Board');
    assert.equal(Object.isFrozen(left), true);
});

test('project universe navigator includes a hub anchor and domain summaries deterministically', () => {
    const universe = Object.freeze({
        hubId: 'project:hub',
        nodes: Object.freeze({
            'project:hub': Object.freeze({ id: 'project:hub', label: 'Logistics Control', x: 0, y: 0, kind: 'project-hub' }),
            'frame:dispatch': Object.freeze({ id: 'frame:dispatch', label: 'Dispatch Board', x: 10, y: 12, kind: 'frame' }),
        }),
        groups: Object.freeze({
            'group:create': Object.freeze({
                id: 'group:create',
                perspectiveId: 'create',
                label: 'Create',
                x: -100,
                y: -80,
                nodeIds: Object.freeze(['frame:dispatch']),
                metadata: Object.freeze({
                    primaryNodeLabel: 'Dispatch Board',
                }),
            }),
        }),
    });

    const items = buildProjectUniverseNavigatorItems({ universe, query: '' });
    assert.equal(items[0].targetType, 'hub');
    assert.equal(items[0].label, 'Logistics Control');
    assert.equal(items[0].subtitle, 'project universe anchor');
    assert.equal(items[1].targetType, 'group');
    assert.equal(items[1].subtitle, '1 artifact · Dispatch Board');
});

test('project universe orientation derives deterministic current, return, related, and sibling targets', () => {
    const universe = Object.freeze({
        hubId: 'project:hub',
        nodes: Object.freeze({
            'project:hub': Object.freeze({ id: 'project:hub', label: 'Logistics Control', x: 0, y: 0, kind: 'project-hub' }),
            'document:primary': Object.freeze({
                id: 'document:primary',
                label: 'Primary Document',
                x: -10,
                y: 5,
                kind: 'document',
                refs: Object.freeze(['group:build', 'project:hub', 'workflow:publish']),
            }),
            'components:library': Object.freeze({
                id: 'components:library',
                label: 'Component Library',
                x: -20,
                y: 10,
                kind: 'component-library',
                refs: Object.freeze(['project:hub']),
            }),
            'workflow:publish': Object.freeze({
                id: 'workflow:publish',
                label: 'Publish Targets',
                x: 20,
                y: 24,
                kind: 'workflow',
                refs: Object.freeze(['document:primary', 'project:hub']),
            }),
        }),
        groups: Object.freeze({
            'group:create': Object.freeze({
                id: 'group:create',
                perspectiveId: 'create',
                label: 'Create',
                x: -100,
                y: -80,
                nodeIds: Object.freeze(['components:library', 'document:primary']),
                metadata: Object.freeze({
                    primaryNodeLabel: 'Primary Document',
                    relatedGroupIds: Object.freeze(['group:build', 'group:publish']),
                }),
            }),
            'group:build': Object.freeze({
                id: 'group:build',
                perspectiveId: 'build',
                label: 'Build',
                x: 100,
                y: -80,
                nodeIds: Object.freeze(['workflow:publish']),
                metadata: Object.freeze({
                    primaryNodeLabel: 'Publish Targets',
                    relatedGroupIds: Object.freeze(['group:create']),
                }),
            }),
            'group:publish': Object.freeze({
                id: 'group:publish',
                perspectiveId: 'publish',
                label: 'Publish',
                x: 100,
                y: 80,
                nodeIds: Object.freeze([]),
                metadata: Object.freeze({
                    relatedGroupIds: Object.freeze(['group:create']),
                }),
            }),
        }),
    });

    const nodeOrientation = buildProjectUniverseOrientation({
        universe,
        targetId: 'document:primary',
        query: 'publish',
    });
    assert.equal(nodeOrientation?.current.targetId, 'document:primary');
    assert.equal(nodeOrientation?.returnTarget?.targetId, 'group:create');
    assert.deepEqual(
        nodeOrientation?.relatedTargets.map((item) => item.targetId),
        ['group:build', 'workflow:publish'],
    );
    assert.deepEqual(
        nodeOrientation?.siblingTargets.map((item) => item.targetId),
        ['components:library'],
    );
    assert.deepEqual(
        nodeOrientation?.matchedTargets.map((item) => item.targetId),
        ['group:build', 'group:publish', 'workflow:publish'],
    );
    assert.deepEqual(
        nodeOrientation?.nextTargets.map((item) => item.targetId),
        ['group:build', 'group:publish', 'workflow:publish'],
    );

    const groupOrientation = buildProjectUniverseOrientation({
        universe,
        targetId: 'group:create',
        query: '',
    });
    assert.equal(groupOrientation?.current.targetId, 'group:create');
    assert.equal(groupOrientation?.returnTarget?.targetId, 'project:hub');
    assert.deepEqual(
        groupOrientation?.relatedTargets.map((item) => item.targetId),
        ['group:build', 'group:publish'],
    );
    assert.deepEqual(
        groupOrientation?.siblingTargets.map((item) => item.targetId),
        ['group:build', 'group:publish'],
    );
    assert.deepEqual(
        groupOrientation?.nextTargets.map((item) => item.targetId),
        ['group:build', 'group:publish'],
    );
});

test('project universe focus target resolves deterministic camera targets for groups and nodes', () => {
    const universe = Object.freeze({
        nodes: Object.freeze({
            'node:a': Object.freeze({ id: 'node:a', x: 11, y: -7 }),
        }),
        groups: Object.freeze({
            'group:create': Object.freeze({ id: 'group:create', x: -90, y: 55 }),
        }),
    });

    assert.deepEqual(
        resolveProjectUniverseFocusTarget({
            universe: Object.freeze({
                hubId: 'project:hub',
                nodes: Object.freeze({
                    'project:hub': Object.freeze({ id: 'project:hub', x: 0, y: 0 }),
                }),
                groups: Object.freeze({}),
            }),
            targetId: 'project:hub',
        }),
        Object.freeze({ id: 'project:hub', targetType: 'hub', x: 0, y: 0, scale: 1 }),
    );
    assert.deepEqual(
        resolveProjectUniverseFocusTarget({ universe, targetId: 'group:create' }),
        Object.freeze({ id: 'group:create', targetType: 'group', x: -90, y: 55, scale: 0.6 }),
    );
    assert.deepEqual(
        resolveProjectUniverseFocusTarget({ universe, targetId: 'node:a' }),
        Object.freeze({ id: 'node:a', targetType: 'node', x: 11, y: -7, scale: 1.25 }),
    );
    assert.equal(resolveProjectUniverseFocusTarget({ universe, targetId: 'missing' }), null);
});
