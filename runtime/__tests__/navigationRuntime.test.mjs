import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import {
    clearNavigationGraphs,
    getCurrentScreen,
    getNavigationState,
    navigate,
    registerNavigationGraph,
} from '@/runtime/navigation/index.js';

test('navigation runtime dispatches navigation through the dispatcher', async () => {
    clearNavigationGraphs();

    registerNavigationGraph({
        id: 'main',
        initial: 'home',
        screens: ['home', 'checkout', 'payment', 'confirmation'],
        transitions: {
            home: ['checkout'],
            checkout: ['payment'],
            payment: ['confirmation'],
        },
    });

    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(
        {
            nodes: {},
            rootIds: [],
            navigation: {
                main: {
                    current: 'home',
                },
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
                    capabilities: ['app:navigate'],
                },
            },
        },
    });

    await navigate('main', 'checkout', { dispatcher });

    const next = dispatcher.getState();
    assert.equal(getCurrentScreen(next, 'main'), 'checkout');
    assert.equal(getNavigationState(next, 'main').current, 'checkout');
});

test('navigation runtime rejects invalid graph transitions', async () => {
    clearNavigationGraphs();

    registerNavigationGraph({
        id: 'main',
        initial: 'home',
        screens: ['home', 'checkout', 'payment'],
        transitions: {
            home: ['checkout'],
            checkout: ['payment'],
        },
    });

    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(
        {
            nodes: {},
            rootIds: [],
            navigation: {
                main: {
                    current: 'home',
                },
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
                    capabilities: ['app:navigate'],
                },
            },
        },
    });

    await assert.rejects(
        () => navigate('main', 'payment', { dispatcher }),
        /Invalid navigation transition home -> payment/
    );
});
