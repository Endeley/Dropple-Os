import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

test('motion events write truth into document.motion through the dispatcher', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(structuredClone(initialRuntimeState), { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'uiux',
                allowedEventTypes: [
                    EventTypes.MOTION_CLIP_CREATE,
                    EventTypes.MOTION_KEYFRAME_ADD,
                ],
                policy: {
                    mutation: 'open',
                    capabilities: ['timeline:edit', 'keyframe:create'],
                },
                timeline: { readOnly: false },
            },
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.MOTION_CLIP_CREATE,
        payload: {
            clip: {
                id: 'clip-1',
                target: 'node-1',
                property: 'opacity',
                keyframes: [],
            },
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.MOTION_KEYFRAME_ADD,
        payload: {
            clipId: 'clip-1',
            keyframe: {
                id: 'kf-clip-1-120',
                t: 120,
                v: 0.5,
                easing: 'ease-in',
            },
        },
    });
    const next = dispatcher.getState();

    assert.deepEqual(next.document.motion.clips['clip-1'], {
        id: 'clip-1',
        target: 'node-1',
        property: 'opacity',
        keyframes: [
            {
                id: 'kf-clip-1-120',
                t: 120,
                v: 0.5,
                easing: 'ease-in',
            },
        ],
    });
    assert.equal(next.timeline?.animations, undefined);
});
