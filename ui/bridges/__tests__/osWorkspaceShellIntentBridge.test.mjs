import test from 'node:test';
import assert from 'node:assert/strict';
import { EventTypes } from '@/core/events/eventTypes.js';
import {
    dispatchOsWorkspaceShellIntent,
    OS_WORKSPACE_SHELL_ALLOWED_ACTIONS,
} from '@/ui/bridges/osSurfaceIntentBridge.js';

test('os workspace shell action allowlist is explicit and stable', () => {
    assert.deepEqual(OS_WORKSPACE_SHELL_ALLOWED_ACTIONS, [
        'workspace.activate',
        'mode.activate',
        'tool.activate',
        'viewport.set',
    ]);
});

test('os workspace shell allowed actions map to canonical intents/events', () => {
    const cases = [
        {
            action: 'workspace.activate',
            payload: { workspaceId: 'design' },
            expectedType: EventTypes.WORKSPACE_SET_ACTIVE,
            expectedPayload: { workspaceId: 'design' },
        },
        {
            action: 'mode.activate',
            payload: { workspaceId: 'media', modeId: 'animation' },
            expectedType: EventTypes.WORKSPACE_SET_ACTIVE,
            expectedPayload: { workspaceId: 'media' },
        },
        {
            action: 'tool.activate',
            payload: { toolId: 'select' },
            expectedType: EventTypes.TOOL_SET_ACTIVE,
            expectedPayload: { toolId: 'select' },
        },
        {
            action: 'viewport.set',
            payload: { viewport: { x: 5, y: 7, zoom: 1.5 } },
            expectedType: EventTypes.WORKSPACE_VIEWPORT_SET,
            expectedPayload: { x: 5, y: 7, zoom: 1.5 },
        },
    ];

    for (const entry of cases) {
        const events = [];
        const result = dispatchOsWorkspaceShellIntent(
            {
                action: entry.action,
                ...entry.payload,
            },
            (event) => events.push(event),
        );
        assert.equal(result.ok, true, `action ${entry.action} should succeed`);
        assert.equal(events.length, 1, `action ${entry.action} should dispatch once`);
        assert.equal(events[0]?.type, entry.expectedType);
        assert.deepEqual(events[0]?.payload, entry.expectedPayload);
    }
});

test('os workspace shell intent bridge fails closed for non-allowlisted actions', () => {
    const events = [];
    const result = dispatchOsWorkspaceShellIntent(
        {
            action: 'workspace.mutate.truth',
            workspaceId: 'design',
        },
        (event) => events.push(event),
    );

    assert.equal(result.ok, false);
    assert.equal(result.reason, 'unsupported-shell-action');
    assert.deepEqual(events, []);
});

test('os workspace shell intent bridge fails closed for invalid mode/workspace payloads', () => {
    const events = [];
    const result = dispatchOsWorkspaceShellIntent(
        {
            action: 'mode.activate',
            workspaceId: 'design',
            modeId: 'animation',
        },
        (event) => events.push(event),
    );

    assert.equal(result.ok, false);
    assert.equal(result.reason, 'invalid-shell-action-payload');
    assert.deepEqual(events, []);
});
