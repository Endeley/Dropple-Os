import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveSelectionContextMenuModel } from '@/runtime/grouping/contextMenuModel.js';

test('empty target does not open selection context menu', () => {
    const model = resolveSelectionContextMenuModel({
        targetNodeId: null,
        selectionIds: ['a'],
        nodesById: {},
    });

    assert.equal(model.shouldOpen, false);
    assert.deepEqual(model.actionIds, []);
});

test('unselected target opens against only that node', () => {
    const model = resolveSelectionContextMenuModel({
        targetNodeId: 'b',
        selectionIds: ['a'],
        nodesById: {
            a: { id: 'a', type: 'frame' },
            b: { id: 'b', type: 'frame' },
        },
    });

    assert.equal(model.shouldOpen, true);
    assert.deepEqual(model.actionIds, ['b']);
    assert.equal(model.canGroup, false);
    assert.equal(model.canUngroup, false);
});

test('selected target preserves multi-selection action model', () => {
    const model = resolveSelectionContextMenuModel({
        targetNodeId: 'b',
        selectionIds: ['a', 'b'],
        nodesById: {
            a: { id: 'a', type: 'frame' },
            b: { id: 'b', type: 'frame' },
        },
    });

    assert.equal(model.shouldOpen, true);
    assert.deepEqual(model.actionIds, ['a', 'b']);
    assert.equal(model.canGroup, true);
    assert.equal(model.canUngroup, false);
});

test('single selected group enables ungroup only', () => {
    const model = resolveSelectionContextMenuModel({
        targetNodeId: 'group-1',
        selectionIds: ['group-1'],
        nodesById: {
            'group-1': { id: 'group-1', type: 'group' },
        },
    });

    assert.equal(model.shouldOpen, true);
    assert.deepEqual(model.actionIds, ['group-1']);
    assert.equal(model.canGroup, false);
    assert.equal(model.canUngroup, true);
});
