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
        'assistant.request',
    ]);
});

test('os workspace shell action policy hash is stable', () => {
    const actionHash = hashRuntimeState(OS_WORKSPACE_SHELL_ALLOWED_ACTIONS);
    assert.equal(actionHash, 'fd2f8e5b0eeb121701cd7f21766821c47f0e0bba3136e8897a78c20b05cd9d5d');
});
