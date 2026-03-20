import test from 'node:test';
import assert from 'node:assert/strict';
import { setRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { handleInputEvent } from '@/runtime/input/inputEngine.js';
import {
    __resetToolHandlers,
    registerToolHandler,
} from '@/runtime/tools/toolController.js';

test('input engine resolves active tool from dispatcher state and routes to handler', () => {
    __resetToolHandlers();
    const calls = [];
    const dispatcher = {
        getState() {
            return {
                tools: {
                    activeTool: 'select',
                    registeredTools: {},
                },
            };
        },
    };

    setRuntimeDispatcher(dispatcher);
    registerToolHandler('select', (input, context) => {
        calls.push({ input, context });
        return 'handled';
    });

    const result = handleInputEvent({ type: 'pointerdown' });

    assert.equal(result, 'handled');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].context.tool, 'select');
    assert.equal(calls[0].context.dispatcher, dispatcher);

    setRuntimeDispatcher(null);
    __resetToolHandlers();
});

test('input engine falls back when no registered handler exists', () => {
    __resetToolHandlers();
    const dispatcher = {
        getState() {
            return {
                tools: {
                    activeTool: 'select',
                    registeredTools: {},
                },
            };
        },
    };

    setRuntimeDispatcher(dispatcher);

    const result = handleInputEvent(
        { type: 'pointerdown' },
        {
            fallbackHandler(input, context) {
                return `${context.tool}:${input.type}`;
            },
        },
    );

    assert.equal(result, 'select:pointerdown');

    setRuntimeDispatcher(null);
    __resetToolHandlers();
});
