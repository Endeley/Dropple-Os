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
