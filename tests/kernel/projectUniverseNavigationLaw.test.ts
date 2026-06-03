import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildProjectUniverseNavigatorItems,
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
            }),
            'group:operate': Object.freeze({
                id: 'group:operate',
                perspectiveId: 'operate',
                label: 'Operate',
                x: 100,
                y: 80,
                nodeIds: Object.freeze(['system:model']),
            }),
        }),
    });

    const left = buildProjectUniverseNavigatorItems({ universe, query: 'dispatch' });
    const right = buildProjectUniverseNavigatorItems({ universe, query: 'dispatch' });

    assert.deepEqual(left, right);
    assert.equal(left.length, 1);
    assert.equal(left[0].targetType, 'node');
    assert.equal(left[0].label, 'Dispatch Board');
    assert.equal(Object.isFrozen(left), true);
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
        resolveProjectUniverseFocusTarget({ universe, targetId: 'group:create' }),
        Object.freeze({ id: 'group:create', targetType: 'group', x: -90, y: 55, scale: 0.6 }),
    );
    assert.deepEqual(
        resolveProjectUniverseFocusTarget({ universe, targetId: 'node:a' }),
        Object.freeze({ id: 'node:a', targetType: 'node', x: 11, y: -7, scale: 1.25 }),
    );
    assert.equal(resolveProjectUniverseFocusTarget({ universe, targetId: 'missing' }), null);
});
