import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateAppRuntime } from '@/runtime/appRuntime/index.js';

test('appRuntime resolves active screen', () => {
    const document = {
        app: {
            currentScreen: 'home',
            screens: {
                home: { id: 'home', root: 'nodeA' },
                settings: { id: 'settings', root: 'nodeB' },
            },
        },
    };

    const next = evaluateAppRuntime(document, {});

    assert.equal(next.app.currentScreen, 'home');
    assert.equal(next.app.resolvedScreen.id, 'home');
});

test('appRuntime evaluation is deterministic', () => {
    const document = {
        app: {
            currentScreen: 'home',
            screens: {
                home: { id: 'home' },
            },
        },
    };

    const runtimeA = evaluateAppRuntime(document, {});
    const runtimeB = evaluateAppRuntime(document, {});

    assert.deepEqual(runtimeA.app, runtimeB.app);
});
