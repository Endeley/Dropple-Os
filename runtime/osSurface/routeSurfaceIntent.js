import { INTENTS } from '@/core/intents/intentTypes.js';
import { EventTypes } from '@/core/events/eventTypes.js';

const FORBIDDEN_PAYLOAD_KEYS = new Set([
    'eventId',
    '__eventId',
    '__mutationOrigin',
    'dispatch',
    'setState',
    'reducer',
    'workspaceDef',
]);

function normalizeString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function resolveDispatch(dispatcherOrDispatch) {
    if (typeof dispatcherOrDispatch === 'function') return dispatcherOrDispatch;
    if (typeof dispatcherOrDispatch?.dispatch === 'function') return dispatcherOrDispatch.dispatch;
    return null;
}

function hasForbiddenKeys(value) {
    if (!value || typeof value !== 'object') return false;
    const keys = Object.keys(value);
    for (const key of keys) {
        if (FORBIDDEN_PAYLOAD_KEYS.has(key)) return true;
        if (hasForbiddenKeys(value[key])) return true;
    }
    return false;
}

function normalizeIntentEnvelope(intent = {}) {
    return Object.freeze({
        type: normalizeString(intent?.type),
        payload: intent?.payload && typeof intent.payload === 'object' ? intent.payload : {},
    });
}

function mapToEvent(intentEnvelope) {
    const { type, payload } = intentEnvelope;
    if (!type) return null;
    if (hasForbiddenKeys(payload)) return null;

    if (type === INTENTS.WORKSPACE_ACTIVATE) {
        const workspaceId = normalizeString(payload.workspaceId ?? payload.id);
        if (!workspaceId) return null;
        return Object.freeze({
            type: EventTypes.WORKSPACE_SET_ACTIVE,
            payload: Object.freeze({ workspaceId }),
        });
    }

    if (type === INTENTS.TOOL_SET_ACTIVE) {
        const toolId = normalizeString(payload.toolId ?? payload.tool);
        if (!toolId) return null;
        return Object.freeze({
            type: EventTypes.TOOL_SET_ACTIVE,
            payload: Object.freeze({ toolId }),
        });
    }

    if (type === INTENTS.CANVAS_SURFACE_SET) {
        const workspaceId = normalizeString(payload.workspaceId);
        const surface = payload.surface && typeof payload.surface === 'object' ? payload.surface : null;
        if (!workspaceId || !surface) return null;
        return Object.freeze({
            type: EventTypes.WORKSPACE_SET_CANVAS_SURFACE,
            payload: Object.freeze({ workspaceId, surface }),
        });
    }

    if (type === INTENTS.VIEWPORT_SET) {
        const viewport = payload.viewport && typeof payload.viewport === 'object' ? payload.viewport : payload;
        if (!viewport || typeof viewport !== 'object') return null;
        return Object.freeze({
            type: EventTypes.WORKSPACE_VIEWPORT_SET,
            payload: Object.freeze({
                x: Number.isFinite(viewport.x) ? Number(viewport.x) : 0,
                y: Number.isFinite(viewport.y) ? Number(viewport.y) : 0,
                zoom: Number.isFinite(viewport.zoom) ? Number(viewport.zoom) : 1,
            }),
        });
    }

    return null;
}

export function routeSurfaceIntent(intent, dispatcherOrDispatch) {
    const dispatch = resolveDispatch(dispatcherOrDispatch);
    if (typeof dispatch !== 'function') return Object.freeze({ ok: false, reason: 'dispatch-unavailable' });

    const envelope = normalizeIntentEnvelope(intent);
    const event = mapToEvent(envelope);
    if (!event) return Object.freeze({ ok: false, reason: 'unsupported-or-invalid-intent' });

    dispatch(event);
    return Object.freeze({ ok: true, event });
}
