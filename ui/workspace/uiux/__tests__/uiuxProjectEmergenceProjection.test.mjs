import test from 'node:test';
import assert from 'node:assert/strict';

import {
    canUIUXContain,
    resolveUIUXDefaultCreateParentId,
    resolveUIUXProjectEmergenceProjection,
} from '../uiuxProjectEmergenceProjection.js';

test('uiux containment definitions expose lawful parent-child relationships', () => {
    assert.equal(canUIUXContain('frame', 'text'), true);
    assert.equal(canUIUXContain('section', 'button'), true);
    assert.equal(canUIUXContain('text', 'image'), false);
});

test('uiux default create parent resolves the selected truthful container', () => {
    const frame = { id: 'frame-1', type: 'frame', parentId: null };

    assert.equal(
        resolveUIUXDefaultCreateParentId({
            activeToolId: 'text',
            selectedNode: frame,
            nodesById: { 'frame-1': frame },
        }),
        'frame-1',
    );
});

test('uiux default create parent falls back to the nearest truthful ancestor', () => {
    const frame = { id: 'frame-1', type: 'frame', parentId: null };
    const text = { id: 'text-1', type: 'text', parentId: 'frame-1' };

    assert.equal(
        resolveUIUXDefaultCreateParentId({
            activeToolId: 'image',
            selectedNode: text,
            nodesById: {
                'frame-1': frame,
                'text-1': text,
            },
        }),
        'frame-1',
    );
});

test('uiux project emergence projection resolves truthful containment for the selected child', () => {
    const frame = { id: 'frame-1', type: 'frame', parentId: null };
    const text = { id: 'text-1', type: 'text', parentId: 'frame-1' };

    assert.deepEqual(
        resolveUIUXProjectEmergenceProjection({
            workspaceId: 'uiux',
            nodeCount: 2,
            selectedNode: text,
            nodesById: {
                'frame-1': frame,
                'text-1': text,
            },
        }),
        {
            parentNodeId: 'frame-1',
            childNodeId: 'text-1',
            parentType: 'frame',
            childType: 'text',
        },
    );
});

test('uiux project emergence projection resolves truthful containment for the selected parent', () => {
    const frame = { id: 'frame-1', type: 'frame', parentId: null };
    const text = { id: 'text-1', type: 'text', parentId: 'frame-1' };

    assert.deepEqual(
        resolveUIUXProjectEmergenceProjection({
            workspaceId: 'uiux',
            nodeCount: 2,
            selectedNode: frame,
            nodesById: {
                'frame-1': frame,
                'text-1': text,
            },
        }),
        {
            parentNodeId: 'frame-1',
            childNodeId: 'text-1',
            parentType: 'frame',
            childType: 'text',
        },
    );
});

test('uiux project emergence projection stays hidden when containment is not truthful', () => {
    const text = { id: 'text-1', type: 'text', parentId: 'image-1' };
    const image = { id: 'image-1', type: 'image', parentId: null };

    assert.equal(
        resolveUIUXProjectEmergenceProjection({
            workspaceId: 'uiux',
            nodeCount: 2,
            selectedNode: text,
            nodesById: {
                'image-1': image,
                'text-1': text,
            },
        }),
        null,
    );
});
