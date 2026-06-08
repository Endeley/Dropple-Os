import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildProjectArtifactContinuityHref,
    normalizeProjectCameraState,
    resolveProjectCameraFromSearchParams,
    resolveProjectPerspectiveContinuityFromSearchParams,
    resolveProjectWorldRouteStateFromSearchParams,
    resolveProjectUniverseFocusFromSearchParams,
    withProjectCameraSearchParams,
    withProjectPerspectiveContinuitySearchParams,
    withProjectUniverseFocusSearchParams,
    withProjectWorldSearchParams,
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

test('project perspective continuity search-param resolution is deterministic and fail-closed', () => {
    const params = new URLSearchParams('pf=create&pt=build&pu=document:primary&pl=Document&pi=Continue%20document%20handoff&pj=workflow&pe=document&ps=uiux&pk=document&pm=dive');
    const continuity = resolveProjectPerspectiveContinuityFromSearchParams(params);
    assert.deepEqual(
        continuity,
        Object.freeze({
            fromPerspectiveId: 'create',
            toPerspectiveId: 'build',
            sourceTargetId: 'document:primary',
            sourceLabel: 'Document',
            sourceIntentLabel: 'Continue document handoff',
            sourceIntentSource: 'workflow',
            targetEntryId: 'document',
            sourceEntryId: 'uiux',
            sourceKind: 'document',
            continuityKind: 'dive',
        }),
    );
});

test('project perspective continuity search-param serialization preserves existing query fields', () => {
    const params = new URLSearchParams('entry=uiux&x=1.00&y=2.00&z=0.500');
    const next = withProjectPerspectiveContinuitySearchParams({
        searchParams: params,
        continuity: {
            fromPerspectiveId: 'create',
            toPerspectiveId: 'build',
            sourceTargetId: 'document:primary',
            sourceLabel: 'Document',
            sourceIntentLabel: 'Continue document handoff',
            sourceIntentSource: 'workflow',
            targetEntryId: 'document',
            sourceEntryId: 'uiux',
            sourceKind: 'document',
            continuityKind: 'dive',
        },
    });
    assert.equal(next.get('entry'), 'uiux');
    assert.equal(next.get('pf'), 'create');
    assert.equal(next.get('pt'), 'build');
    assert.equal(next.get('pu'), 'document:primary');
    assert.equal(next.get('pl'), 'Document');
    assert.equal(next.get('pi'), 'Continue document handoff');
    assert.equal(next.get('pj'), 'workflow');
    assert.equal(next.get('pe'), 'document');
    assert.equal(next.get('ps'), 'uiux');
    assert.equal(next.get('pk'), 'document');
    assert.equal(next.get('pm'), 'dive');
});

test('project world route-state resolution is deterministic and frozen', () => {
    const params = new URLSearchParams(
        'entry=uiux&x=12.25&y=-6.50&z=0.750&u=group:operate&uq=operate&pf=create&pt=build&pu=group:operate&pl=Operate&pi=Move%20into%20operate&pj=workflow&pe=automation&ps=uiux&pk=workflow&pm=hop',
    );
    const state = resolveProjectWorldRouteStateFromSearchParams(params);
    assert.deepEqual(state, Object.freeze({
        camera: Object.freeze({ x: 12.25, y: -6.5, scale: 0.75 }),
        focus: Object.freeze({ targetId: 'group:operate', query: 'operate' }),
        continuity: Object.freeze({
            fromPerspectiveId: 'create',
            toPerspectiveId: 'build',
            sourceTargetId: 'group:operate',
            sourceLabel: 'Operate',
            sourceIntentLabel: 'Move into operate',
            sourceIntentSource: 'workflow',
            targetEntryId: 'automation',
            sourceEntryId: 'uiux',
            sourceKind: 'workflow',
            continuityKind: 'hop',
        }),
    }));
    assert.equal(Object.isFrozen(state), true);
});

test('project world search-param serialization preserves route continuity envelope during camera updates', () => {
    const params = new URLSearchParams(
        'entry=uiux&u=group:operate&uq=operate&pf=create&pt=build&pu=group:operate&pl=Operate&pi=Move%20into%20operate&pj=workflow&pe=automation&ps=uiux&pk=workflow&pm=hop',
    );
    const next = withProjectWorldSearchParams({
        searchParams: params,
        camera: { x: 48.123, y: -12.4, scale: 0.61234 },
        focus: { targetId: 'group:operate', query: 'operate' },
        continuity: {
            fromPerspectiveId: 'create',
            toPerspectiveId: 'build',
            sourceTargetId: 'group:operate',
            sourceLabel: 'Operate',
            sourceIntentLabel: 'Move into operate',
            sourceIntentSource: 'workflow',
            targetEntryId: 'automation',
            sourceEntryId: 'uiux',
            sourceKind: 'workflow',
            continuityKind: 'hop',
        },
    });
    assert.equal(next.get('entry'), 'uiux');
    assert.equal(next.get('x'), '48.12');
    assert.equal(next.get('y'), '-12.40');
    assert.equal(next.get('z'), '0.612');
    assert.equal(next.get('u'), 'group:operate');
    assert.equal(next.get('uq'), 'operate');
    assert.equal(next.get('pf'), 'create');
    assert.equal(next.get('pt'), 'build');
    assert.equal(next.get('pu'), 'group:operate');
    assert.equal(next.get('pl'), 'Operate');
    assert.equal(next.get('pi'), 'Move into operate');
    assert.equal(next.get('pj'), 'workflow');
    assert.equal(next.get('pe'), 'automation');
    assert.equal(next.get('ps'), 'uiux');
    assert.equal(next.get('pk'), 'workflow');
    assert.equal(next.get('pm'), 'hop');
});

test('artifact continuity href serialization preserves camera focus and artifact handoff metadata deterministically', () => {
    const href = buildProjectArtifactContinuityHref({
        href: '/workspace/operate?entry=systems-engineering&u=system:model',
        camera: { x: 8.37, y: 4.2, scale: 1 },
        query: 'operate',
        currentPerspectiveId: 'build',
        currentEntryId: 'application',
        continuityTarget: Object.freeze({
            targetId: 'system:model',
            label: 'System Model',
            kind: 'system-model',
        }),
        continuityIntentLabel: 'Move from build planning into live operating context.',
        continuityIntentSource: 'workflow',
    });

    const url = new URL(href, 'https://dropple.local');
    assert.equal(url.pathname, '/workspace/operate');
    assert.equal(url.searchParams.get('entry'), 'systems-engineering');
    assert.equal(url.searchParams.get('u'), 'system:model');
    assert.equal(url.searchParams.get('uq'), 'operate');
    assert.equal(url.searchParams.get('pf'), 'build');
    assert.equal(url.searchParams.get('pt'), 'operate');
    assert.equal(url.searchParams.get('pu'), 'system:model');
    assert.equal(url.searchParams.get('pl'), 'System Model');
    assert.equal(url.searchParams.get('pi'), 'Move from build planning into live operating context.');
    assert.equal(url.searchParams.get('pj'), 'workflow');
    assert.equal(url.searchParams.get('pe'), 'systems-engineering');
    assert.equal(url.searchParams.get('ps'), 'application');
    assert.equal(url.searchParams.get('pk'), 'system-model');
    assert.equal(url.searchParams.get('pm'), 'hop');
});

test('artifact continuity href treats same-perspective overlay artifact navigation as a dive', () => {
    const href = buildProjectArtifactContinuityHref({
        href: '/workspace/operate?entry=systems-engineering&u=workflow:graph:architecture',
        camera: { x: 3.5, y: -1.25, scale: 0.6 },
        query: 'operate',
        currentPerspectiveId: 'operate',
        currentEntryId: 'systems-engineering',
        continuityTarget: Object.freeze({
            targetId: 'workflow:graph:architecture',
            label: 'Architecture',
            kind: 'workflow',
        }),
        continuityIntentLabel: 'Inspect architecture in the current operate room.',
        continuityIntentSource: 'priority',
    });

    const url = new URL(href, 'https://dropple.local');
    assert.equal(url.pathname, '/workspace/operate');
    assert.equal(url.searchParams.get('entry'), 'systems-engineering');
    assert.equal(url.searchParams.get('u'), 'workflow:graph:architecture');
    assert.equal(url.searchParams.get('pf'), 'operate');
    assert.equal(url.searchParams.get('pt'), 'operate');
    assert.equal(url.searchParams.get('pu'), 'workflow:graph:architecture');
    assert.equal(url.searchParams.get('pl'), 'Architecture');
    assert.equal(url.searchParams.get('pi'), 'Inspect architecture in the current operate room.');
    assert.equal(url.searchParams.get('pj'), 'priority');
    assert.equal(url.searchParams.get('pe'), 'systems-engineering');
    assert.equal(url.searchParams.get('ps'), 'systems-engineering');
    assert.equal(url.searchParams.get('pk'), 'workflow');
    assert.equal(url.searchParams.get('pm'), 'dive');
});
