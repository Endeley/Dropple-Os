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

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'media',
            mode: 'audio',
        }),
        ['graph', 'timeline'],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'media',
            mode: 'podcast',
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

test('resolveWorkspaceCapabilities exposes system authoring overlays per mode deterministically', () => {
    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'system',
            mode: 'tokens',
        }),
        ['token-authoring'],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'system',
            mode: 'tokens',
            overlayId: 'themes',
        }),
        ['token-authoring', 'theme-authoring'],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'system',
            mode: 'governance',
        }),
        ['token-versioning', 'token-review'],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'system',
            mode: 'versioning',
        }),
        ['token-versioning', 'token-review'],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'system',
            mode: 'themes',
        }),
        [],
    );
});

test('resolveWorkspaceCapabilities keeps low-risk overlay specializations inert unless explicitly requested', () => {
    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'system',
            mode: 'components',
        }),
        [],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'system',
            mode: 'components',
            overlayId: 'variants',
        }),
        [],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'collaborate',
            mode: 'review',
        }),
        [],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'collaborate',
            mode: 'review',
            overlayId: 'comments',
        }),
        [],
    );
});

test('resolveWorkspaceCapabilities exposes assistive AI overlay capabilities only when requested explicitly', () => {
    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'build',
            mode: 'automation',
        }),
        [],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'build',
            mode: 'automation',
            overlayId: 'ai-systems',
        }),
        ['ai-assist', 'ai-explain', 'ai-generate'],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'build',
            mode: 'automation',
            overlayId: 'systems-engineering',
        }),
        [
            'systems-graph',
            'systems-control',
            'systems-dataflow',
            'systems-simulation',
            'systems-documentation',
        ],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'build',
            mode: 'automation',
            overlayId: 'enterprise-operations',
        }),
        [
            'ops-process',
            'ops-automation',
            'ops-datasource',
            'ops-roles',
            'ops-ai-assist',
        ],
    );
});

test('resolveWorkspaceCapabilities exposes guided learning capabilities only when requested explicitly', () => {
    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'collaborate',
            mode: 'knowledge',
        }),
        [],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'collaborate',
            mode: 'knowledge',
            overlayId: 'learning',
        }),
        ['guided-navigation', 'step-through', 'guided-explain'],
    );
});
