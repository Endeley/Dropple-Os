import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { assertReducerOwnership } from '@/core/events/reducerOwnership.js';
import { behaviorReducers } from '@/core/events/reducers/behaviorReducers.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

test('behavior state commit mutates canonical sceneGraph truth instead of the runtime nodes mirror', () => {
    const state = structuredClone(initialRuntimeState);
    state.document.sceneGraph = {
        ...state.document.sceneGraph,
        nodes: {
            hero: {
                id: 'hero',
                type: 'frame',
                style: { color: 'red' },
                visible: true,
            },
        },
        rootIds: ['hero'],
    };
    state.behaviors = {
        hero: {
            baseStateId: 'idle',
            states: [
                {
                    id: 'idle',
                    propertyOverrides: {},
                },
                {
                    id: 'focused',
                    propertyOverrides: {
                        style: { color: 'blue' },
                        visible: false,
                    },
                },
            ],
            transitions: [],
            triggers: [],
        },
    };
    state.behaviorRuntime = {
        hero: {
            currentStateId: 'idle',
        },
    };
    state.nodes = {
        hero: {
            id: 'hero',
            style: { color: 'stale-runtime-copy' },
            visible: true,
        },
    };

    const rawNext = behaviorReducers(state, {
        type: EventTypes.BEHAVIOR_STATE_COMMIT,
        payload: {
            entityId: 'hero',
            targetStateId: 'focused',
        },
    });
    const next = assertReducerOwnership('behaviorReducers', state, rawNext, {
        allowedDocumentSlices: ['sceneGraph'],
        allowedRuntimeSlices: ['behaviors', 'behaviorRuntime'],
    });

    assert.equal(next.document.sceneGraph.nodes.hero.style.color, 'blue');
    assert.equal(next.document.sceneGraph.nodes.hero.visible, false);
    assert.equal(next.behaviorRuntime.hero.currentStateId, 'focused');
    assert.equal(next.nodes.hero.style.color, 'stale-runtime-copy');
    assert.equal(next.nodes.hero.visible, true);
});
