import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import {
    isSystemsOverlayEventType,
    listSystemsOverlayEventTypes,
    validateSystemsOverlayEvent,
} from '@/core/events/systemsOverlayEventSchema.js';

test('systems overlay event type registry is deterministic', () => {
    assert.deepEqual(listSystemsOverlayEventTypes(), [
        EventTypes.SYSTEMS_NODE_DEFINE,
        EventTypes.SYSTEMS_RELATION_DEFINE,
        EventTypes.SYSTEMS_SIMULATION_RUN,
        EventTypes.OPS_PROCESS_DEFINE,
        EventTypes.OPS_WORKFLOW_DEFINE,
        EventTypes.OPS_AUTOMATION_RUN,
    ]);
});

test('systems overlay validator accepts supported events with object payloads', () => {
    const result = validateSystemsOverlayEvent({
        type: EventTypes.SYSTEMS_NODE_DEFINE,
        payload: { id: 'drone', kind: 'system.component' },
    });

    assert.equal(result.ok, true);
    assert.equal(result.code, 'ok');
});

test('systems overlay validator fails closed for malformed envelopes and unsupported events', () => {
    assert.equal(validateSystemsOverlayEvent(null).ok, false);
    assert.equal(
        validateSystemsOverlayEvent({ type: 'node/create', payload: {} }).code,
        'unsupported-event-type',
    );
    assert.equal(
        validateSystemsOverlayEvent({ type: EventTypes.OPS_PROCESS_DEFINE, payload: null }).code,
        'invalid-payload',
    );
});

test('systems overlay type guard is precise', () => {
    assert.equal(isSystemsOverlayEventType(EventTypes.OPS_WORKFLOW_DEFINE), true);
    assert.equal(isSystemsOverlayEventType(EventTypes.NODE_CREATE), false);
});

