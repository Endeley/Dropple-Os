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
        'assistant.request',
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

test('os workspace shell assistant request routes through canonical assistant enqueue', async () => {
    const events = [];
    const result = await dispatchOsWorkspaceShellIntent(
        {
            action: 'assistant.request',
            assistantId: 'assistant.design',
            assistantAction: 'recommend',
            perspectiveId: 'create',
            assistantInput: { prompt: 'Suggest three directions.' },
        },
        (event) => events.push(event),
    );

    assert.equal(result.ok, true);
    assert.equal(result.assistantId, 'assistant.design');
    assert.equal(result.assistantAction, 'recommend');
    assert.equal(result.eventType, EventTypes.AI_REQUEST_ENQUEUE);
    assert.equal(typeof result.requestId, 'string');
    assert.equal(events.length, 1);
    assert.equal(events[0]?.type, EventTypes.AI_REQUEST_ENQUEUE);
    assert.equal(events[0]?.payload?.request?.metadata?.assistantId, 'assistant.design');
});

test('os workspace shell assistant request validates payload fail-closed', async () => {
    const events = [];
    const result = await dispatchOsWorkspaceShellIntent(
        {
            action: 'assistant.request',
            assistantId: '',
            assistantAction: 'recommend',
        },
        (event) => events.push(event),
    );

    assert.equal(result.ok, false);
    assert.equal(result.reason, 'invalid-shell-action-payload');
    assert.deepEqual(events, []);
});

test('os workspace shell assistant request fails closed on perspective mismatch', async () => {
    const events = [];
    const result = await dispatchOsWorkspaceShellIntent(
        {
            action: 'assistant.request',
            assistantId: 'assistant.publish',
            assistantAction: 'recommend',
            perspectiveId: 'build',
            assistantInput: { prompt: 'publish checklist' },
        },
        (event) => events.push(event),
    );

    assert.equal(result.ok, false);
    assert.match(result.reason, /assistant perspective mismatch/);
    assert.deepEqual(events, []);
});
