import { EventTypes } from './eventTypes.js';

const SYSTEMS_OVERLAY_EVENT_TYPES = Object.freeze([
    EventTypes.SYSTEMS_NODE_DEFINE,
    EventTypes.SYSTEMS_RELATION_DEFINE,
    EventTypes.SYSTEMS_SIMULATION_RUN,
    EventTypes.OPS_PROCESS_DEFINE,
    EventTypes.OPS_WORKFLOW_DEFINE,
    EventTypes.OPS_AUTOMATION_RUN,
]);

function isObject(value) {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function isSystemsOverlayEventType(type) {
    return SYSTEMS_OVERLAY_EVENT_TYPES.includes(type);
}

export function validateSystemsOverlayEvent(event) {
    if (!isObject(event) || typeof event.type !== 'string') {
        return Object.freeze({
            ok: false,
            code: 'invalid-event-envelope',
            reason: 'event must be an object with string type',
        });
    }

    if (!isSystemsOverlayEventType(event.type)) {
        return Object.freeze({
            ok: false,
            code: 'unsupported-event-type',
            reason: `event type "${event.type}" is not in systems overlay authority`,
        });
    }

    if (!isObject(event.payload)) {
        return Object.freeze({
            ok: false,
            code: 'invalid-payload',
            reason: 'payload must be a plain object',
        });
    }

    return Object.freeze({
        ok: true,
        code: 'ok',
        reason: null,
    });
}

export function listSystemsOverlayEventTypes() {
    return [...SYSTEMS_OVERLAY_EVENT_TYPES];
}

