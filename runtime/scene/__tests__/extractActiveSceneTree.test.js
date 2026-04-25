import test from 'node:test';
import assert from 'node:assert/strict';

import { extractActiveSceneTree } from '../extractActiveSceneTree.js';

test('extractActiveSceneTree scopes to the active shot composition root', () => {
    const sceneGraph = {
        rootIds: ['fallback-root'],
        nodes: {
            'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
            compA: { id: 'compA', type: 'frame', children: ['childA'] },
            childA: { id: 'childA', type: 'rect', children: [] },
            compB: { id: 'compB', type: 'frame', children: ['childB'] },
            childB: { id: 'childB', type: 'rect', children: [] },
        },
        scenes: [
            {
                id: 'sceneA',
                shots: [
                    { id: 'shotA', compositionId: 'compA' },
                    { id: 'shotB', compositionId: 'compB' },
                ],
            },
        ],
    };

    const result = extractActiveSceneTree(sceneGraph, 'sceneA', 'shotB');

    assert.equal(result.id, 'compB');
    assert.equal(result.children[0].id, 'childB');
});

test('extractActiveSceneTree throws deterministically in strict mode when scene has no composition root', () => {
    const sceneGraph = {
        rootIds: ['fallback-root'],
        nodes: {
            'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
        },
        scenes: [
            {
                id: 'sceneA',
                shots: [{ id: 'shotA', compositionId: 'missing-root' }],
            },
        ],
    };

    assert.throws(
        () => extractActiveSceneTree(sceneGraph, 'sceneA', 'shotA', { strict: true }),
        /extractActiveSceneTree: no valid composition root \(sceneA\)/,
    );
    assert.throws(
        () => extractActiveSceneTree(sceneGraph, 'sceneA', 'shotA', { strict: true }),
        /extractActiveSceneTree: no valid composition root \(sceneA\)/,
    );
});
