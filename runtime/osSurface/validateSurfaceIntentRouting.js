import { INTENTS } from '@/core/intents/intentTypes.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import { routeSurfaceIntent } from './routeSurfaceIntent.js';

function clone(value) {
    if (value == null) return value;
    if (typeof value !== 'object') return value;
    return JSON.parse(JSON.stringify(value));
}

function runAcceptedCases() {
    const acceptedCases = [
        {
            intent: { type: INTENTS.WORKSPACE_ACTIVATE, payload: { workspaceId: 'design' } },
            expectedEvent: { type: EventTypes.WORKSPACE_SET_ACTIVE, payload: { workspaceId: 'design' } },
        },
        {
            intent: { type: INTENTS.TOOL_SET_ACTIVE, payload: { toolId: 'select' } },
            expectedEvent: { type: EventTypes.TOOL_SET_ACTIVE, payload: { toolId: 'select' } },
        },
        {
            intent: {
                type: INTENTS.CANVAS_SURFACE_SET,
                payload: { workspaceId: 'design', surface: { kind: 'graphics', width: 1000, height: 800 } },
            },
            expectedEvent: {
                type: EventTypes.WORKSPACE_SET_CANVAS_SURFACE,
                payload: { workspaceId: 'design', surface: { kind: 'graphics', width: 1000, height: 800 } },
            },
        },
        {
            intent: { type: INTENTS.VIEWPORT_SET, payload: { viewport: { x: 9, y: 7, zoom: 1.25 } } },
            expectedEvent: { type: EventTypes.WORKSPACE_VIEWPORT_SET, payload: { x: 9, y: 7, zoom: 1.25 } },
        },
    ];

    const failures = [];
    for (const entry of acceptedCases) {
        const a = [];
        const b = [];
        const left = routeSurfaceIntent(entry.intent, (event) => a.push(event));
        const right = routeSurfaceIntent(entry.intent, (event) => b.push(event));
        if (left.ok !== true || right.ok !== true) {
            failures.push(`accepted intent rejected: ${entry.intent.type}`);
            continue;
        }
        if (JSON.stringify(a) !== JSON.stringify(b)) {
            failures.push(`accepted intent not deterministic: ${entry.intent.type}`);
            continue;
        }
        if (JSON.stringify(a[0]) !== JSON.stringify(entry.expectedEvent)) {
            failures.push(`accepted intent mapped unexpected event: ${entry.intent.type}`);
        }
    }

    return Object.freeze({
        ok: failures.length === 0,
        failures: Object.freeze(failures),
        count: acceptedCases.length,
    });
}

function runRejectedCases() {
    const rejectedCases = [
        {
            label: 'unsupported-type',
            intent: { type: 'intent.os.surface.hack', payload: { any: 1 } },
        },
        {
            label: 'authority-bearing-key',
            intent: { type: INTENTS.WORKSPACE_ACTIVATE, payload: { workspaceId: 'design', workspaceDef: { id: 'x' } } },
        },
        {
            label: 'nested-authority-bearing-key',
            intent: { type: INTENTS.WORKSPACE_ACTIVATE, payload: { workspaceId: 'design', details: { reducer: true } } },
        },
        {
            label: 'missing-required-workspace-id',
            intent: { type: INTENTS.WORKSPACE_ACTIVATE, payload: { workspaceId: '' } },
        },
        {
            label: 'invalid-canvas-surface-shape',
            intent: { type: INTENTS.CANVAS_SURFACE_SET, payload: { workspaceId: 'design', surface: null } },
        },
    ];

    const failures = [];
    for (const entry of rejectedCases) {
        const events = [];
        const result = routeSurfaceIntent(entry.intent, (event) => events.push(event));
        if (result.ok !== false) {
            failures.push(`rejected intent accepted: ${entry.label}`);
            continue;
        }
        if (events.length !== 0) {
            failures.push(`rejected intent emitted event: ${entry.label}`);
        }
    }

    const missingDispatch = routeSurfaceIntent(
        { type: INTENTS.TOOL_SET_ACTIVE, payload: { toolId: 'select' } },
        null,
    );
    if (missingDispatch.ok !== false || missingDispatch.reason !== 'dispatch-unavailable') {
        failures.push('missing dispatch did not fail-closed');
    }

    return Object.freeze({
        ok: failures.length === 0,
        failures: Object.freeze(failures),
        count: rejectedCases.length + 1,
    });
}

export function evaluateSurfaceIntentRoutingContract() {
    const before = clone(getRuntimeState());
    const accepted = runAcceptedCases();
    const rejected = runRejectedCases();
    const after = clone(getRuntimeState());
    const mutationFree = JSON.stringify(before) === JSON.stringify(after);

    const failures = [];
    if (!accepted.ok) failures.push(...accepted.failures);
    if (!rejected.ok) failures.push(...rejected.failures);
    if (!mutationFree) failures.push('routing contract mutated runtime truth');

    return Object.freeze({
        ok: failures.length === 0,
        mutationFree,
        acceptedCount: accepted.count,
        rejectedCount: rejected.count,
        failures: Object.freeze(failures),
    });
}
