import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { registerStateMachine, clearStateMachines } from '@/runtime/stateMachines/stateMachineRegistry.js';
import { transition } from '@/runtime/stateMachines/stateMachineRuntime.js';
import { getMachineState } from '@/runtime/stateMachines/stateMachineSelectors.js';

test('state machine transition dispatches through runtime dispatcher', async () => {
    clearStateMachines();

    registerStateMachine({
        id: 'checkout',
        initial: 'cart',
        states: ['cart', 'shipping', 'payment', 'confirmation'],
    });

    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(
        {
            nodes: {},
            rootIds: [],
            stateMachines: {
                checkout: 'cart',
            },
        },
        { animate: false },
    );
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'dev',
                policy: {
                    capabilities: ['app:state-machine'],
                },
            },
        },
    });

    await transition('checkout', 'shipping', { dispatcher });

    const next = dispatcher.getState();
    assert.equal(getMachineState(next, 'checkout'), 'shipping');
    assert.equal(next.stateMachines.checkout, 'shipping');
});

test('state machine transition rejects invalid targets', async () => {
    clearStateMachines();

    registerStateMachine({
        id: 'checkout',
        initial: 'cart',
        states: ['cart', 'shipping'],
    });

    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(
        {
            nodes: {},
            rootIds: [],
            stateMachines: {
                checkout: 'cart',
            },
        },
        { animate: false },
    );
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'dev',
                policy: {
                    capabilities: ['app:state-machine'],
                },
            },
        },
    });

    await assert.rejects(() => transition('checkout', 'payment', { dispatcher }), /Invalid state payment/);
});
