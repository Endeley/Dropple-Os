import test from 'node:test';
import assert from 'node:assert/strict';
import { hashRuntimeState } from '@/core/persistence/hashDocument.js';
import {
    OS_WORKSPACE_SHELL_ACTION_POLICY_VERSION,
    OS_WORKSPACE_SHELL_ALLOWED_ACTIONS,
} from '@/runtime/osSurface/shellActionPolicy.js';

test('os workspace shell action policy snapshot is deterministic', () => {
    assert.equal(OS_WORKSPACE_SHELL_ACTION_POLICY_VERSION, '1');
    assert.deepEqual(OS_WORKSPACE_SHELL_ALLOWED_ACTIONS, [
        'workspace.activate',
        'mode.activate',
        'tool.activate',
        'viewport.set',
    ]);
});

test('os workspace shell action policy hash is stable', () => {
    const actionHash = hashRuntimeState(OS_WORKSPACE_SHELL_ALLOWED_ACTIONS);
    assert.equal(actionHash, 'ba78c492a1322bb4e3972e7d2c1aaa77be2e52698814a6ac29671e5eac5f9e1e');
});
