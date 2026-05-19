import test from 'node:test';
import assert from 'node:assert/strict';
import { INTENTS } from '@/core/intents/intentTypes.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { routeSurfaceIntent } from '@/runtime/osSurface/routeSurfaceIntent.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';

test('routeSurfaceIntent routes deterministically for same input', () => {
    const eventsA = [];
    const eventsB = [];

    const input = {
        type: INTENTS.WORKSPACE_ACTIVATE,
        payload: { workspaceId: 'design' },
    };
    const resA = routeSurfaceIntent(input, (event) => eventsA.push(event));
    const resB = routeSurfaceIntent(input, (event) => eventsB.push(event));

    assert.equal(resA.ok, true);
    assert.equal(resB.ok, true);
    assert.deepEqual(eventsA, eventsB);
    assert.equal(eventsA[0]?.type, EventTypes.WORKSPACE_SET_ACTIVE);
    assert.deepEqual(eventsA[0]?.payload, { workspaceId: 'design' });
});

test('routeSurfaceIntent fails closed for unsupported or authority-bearing payloads', () => {
    const events = [];
    const unsupported = routeSurfaceIntent(
        { type: 'intent.os.surface.hack', payload: { any: 1 } },
        (event) => events.push(event),
    );
    assert.equal(unsupported.ok, false);

    const authorityBearing = routeSurfaceIntent(
        {
            type: INTENTS.WORKSPACE_ACTIVATE,
            payload: {
                workspaceId: 'design',
                workspaceDef: { id: 'illegal' },
            },
        },
        (event) => events.push(event),
    );
    assert.equal(authorityBearing.ok, false);
    assert.deepEqual(events, []);
});

test('routeSurfaceIntent is coordination-only and does not mutate runtime truth', () => {
    const before = getRuntimeState();
    const result = routeSurfaceIntent(
        { type: INTENTS.TOOL_SET_ACTIVE, payload: { toolId: 'select' } },
        () => {},
    );
    const after = getRuntimeState();

    assert.equal(result.ok, true);
    assert.deepEqual(after, before);
});
