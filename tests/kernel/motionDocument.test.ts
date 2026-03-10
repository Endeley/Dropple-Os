import test from 'node:test';
import assert from 'node:assert/strict';

import { animationReducers } from '@/core/events/reducers/animationReducers.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

test('animation reducer writes motion truth into document.motion', () => {
    const state = structuredClone(initialRuntimeState);

    const next = animationReducers(state, {
        type: EventTypes.ANIMATION_KEYFRAME_CREATE,
        payload: {
            clipId: 'clip-1',
            nodeId: 'node-1',
            property: 'opacity',
            timeMs: 120,
            value: 0.5,
            easing: 'ease-in',
        },
    });

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
