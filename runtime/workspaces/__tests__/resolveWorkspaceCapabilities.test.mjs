import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveWorkspaceCapabilities } from '@/runtime/workspaces/index.js';

test('resolveWorkspaceCapabilities merges workspace and mode capabilities deterministically', () => {
    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'media',
            mode: 'animation',
        }),
        ['graph', 'timeline', 'rig', 'stateMachine'],
    );
});

test('resolveWorkspaceCapabilities preserves base capability order for non-overlay modes', () => {
    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'media',
            mode: 'video',
        }),
        ['graph', 'timeline'],
    );
});

test('resolveWorkspaceCapabilities returns an empty list for unknown workspaces', () => {
    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'unknown',
            mode: 'mystery',
        }),
        [],
    );
});
