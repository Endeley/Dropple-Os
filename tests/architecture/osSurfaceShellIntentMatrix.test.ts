import test from 'node:test';
import assert from 'node:assert/strict';
import { dispatchOsWorkspaceShellIntent } from '@/ui/bridges/osSurfaceIntentBridge.js';

test('os surface shell intent matrix accepts only allowlisted actions with valid payloads', () => {
    const events = [];
    const dispatcher = {
        dispatch(event) {
            events.push(event);
        },
    };

    const accepted = [
        dispatchOsWorkspaceShellIntent(
            { action: 'workspace.activate', workspaceId: 'design' },
            dispatcher,
        ),
        dispatchOsWorkspaceShellIntent(
            { action: 'mode.activate', workspaceId: 'design', modeId: 'graphic' },
            dispatcher,
        ),
        dispatchOsWorkspaceShellIntent(
            { action: 'tool.activate', toolId: 'select' },
            dispatcher,
        ),
        dispatchOsWorkspaceShellIntent(
            { action: 'viewport.set', viewport: { x: 4, y: 3, zoom: 1.25 } },
            dispatcher,
        ),
    ];

    for (const result of accepted) {
        assert.equal(result?.ok, true);
    }
    assert.equal(events.length, 4);
});

test('os surface shell intent matrix fails closed for unsupported and malformed actions', () => {
    const events = [];
    const dispatcher = {
        dispatch(event) {
            events.push(event);
        },
    };

    const rejected = [
        dispatchOsWorkspaceShellIntent(
            { action: 'session.takeover', workspaceId: 'design' },
            dispatcher,
        ),
        dispatchOsWorkspaceShellIntent(
            { action: 'workspace.activate', workspaceId: '' },
            dispatcher,
        ),
        dispatchOsWorkspaceShellIntent(
            { action: 'tool.activate', toolId: '' },
            dispatcher,
        ),
        dispatchOsWorkspaceShellIntent(
            { action: 'viewport.set', viewport: null },
            dispatcher,
        ),
        dispatchOsWorkspaceShellIntent(
            { action: 'workspace.activate', workspaceId: 'design' },
            null,
        ),
        dispatchOsWorkspaceShellIntent(
            { action: null, workspaceId: 'design' },
            dispatcher,
        ),
    ];

    assert.deepEqual(
        rejected.map((entry) => entry?.ok),
        [false, false, false, true, false, false],
    );
    assert.deepEqual(
        rejected.map((entry) => entry?.reason),
        [
            'unsupported-shell-action',
            'unsupported-or-invalid-intent',
            'unsupported-or-invalid-intent',
            undefined,
            'dispatch-unavailable',
            'unsupported-shell-action',
        ],
    );
    assert.equal(events.length, 1);
});
