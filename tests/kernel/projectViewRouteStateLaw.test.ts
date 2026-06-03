import test from 'node:test';
import assert from 'node:assert/strict';

import {
    normalizeProjectCameraState,
    resolveProjectCameraFromSearchParams,
    resolveProjectUniverseFocusFromSearchParams,
    withProjectCameraSearchParams,
    withProjectUniverseFocusSearchParams,
} from '@/runtime/workspaces/projectViewRouteState.js';

test('project camera normalization is deterministic and fail-closed', () => {
    const left = normalizeProjectCameraState({
        x: Number.NaN,
        y: 20001,
        scale: 0.01,
    });
    const right = normalizeProjectCameraState({
        x: Number.NaN,
        y: 20001,
        scale: 0.01,
    });

    assert.deepEqual(left, Object.freeze({ x: 0, y: 10000, scale: 0.1 }));
    assert.deepEqual(left, right);
    assert.equal(Object.isFrozen(left), true);
});

test('project camera search-param resolution is deterministic', () => {
    const params = new URLSearchParams('entry=uiux&x=-123.45&y=10.25&z=2.75');
    const camera = resolveProjectCameraFromSearchParams(params);
    assert.deepEqual(camera, Object.freeze({ x: -123.45, y: 10.25, scale: 2.75 }));
});

test('project camera search-param serialization preserves existing query fields', () => {
    const params = new URLSearchParams('entry=uiux&blueprints=startup.v1');
    const next = withProjectCameraSearchParams({
        searchParams: params,
        camera: { x: 12.3456, y: -9.4, scale: 1.23456 },
    });
    assert.equal(next.get('entry'), 'uiux');
    assert.equal(next.get('blueprints'), 'startup.v1');
    assert.equal(next.get('x'), '12.35');
    assert.equal(next.get('y'), '-9.40');
    assert.equal(next.get('z'), '1.235');
});

test('project universe focus search-param resolution is deterministic and fail-closed', () => {
    const params = new URLSearchParams('entry=uiux&u=node-1&uq= project ');
    const focus = resolveProjectUniverseFocusFromSearchParams(params);
    assert.deepEqual(focus, Object.freeze({ targetId: 'node-1', query: 'project' }));
});

test('project universe focus search-param serialization preserves existing query fields', () => {
    const params = new URLSearchParams('entry=uiux&x=1.00&y=2.00&z=0.500');
    const next = withProjectUniverseFocusSearchParams({
        searchParams: params,
        focus: { targetId: 'group:create', query: 'dispatch' },
    });
    assert.equal(next.get('entry'), 'uiux');
    assert.equal(next.get('x'), '1.00');
    assert.equal(next.get('u'), 'group:create');
    assert.equal(next.get('uq'), 'dispatch');
});
