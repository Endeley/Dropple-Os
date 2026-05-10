import test from 'node:test';
import assert from 'node:assert/strict';
import { setRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { handleInputEvent } from '@/runtime/input/inputEngine.js';
import {
    __resetToolHandlers,
    registerToolHandler,
} from '@/runtime/tools/toolController.js';
import { handleKeyboardEvent } from '@/runtime/input/keyboardEngine.js';

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
        return { handled: true };
    });

    const result = handleInputEvent({ type: 'pointerdown' });

    assert.equal(result.handled, true);
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
                return {
                    handled: true,
                    tool: context.tool,
                    inputType: input.type,
                };
            },
        },
    );

    assert.equal(result.handled, true);
    assert.equal(result.tool, 'select');
    assert.equal(result.inputType, 'pointerdown');

    setRuntimeDispatcher(null);
    __resetToolHandlers();
});

test('input engine falls back when a registered handler declines the event', () => {
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
    registerToolHandler('select', () => null);

    const result = handleInputEvent(
        { type: 'pointermove' },
        {
            fallbackHandler(input, context) {
                return {
                    handled: true,
                    tool: context.tool,
                    inputType: input.type,
                };
            },
        },
    );

    assert.equal(result.handled, true);
    assert.equal(result.tool, 'select');
    assert.equal(result.inputType, 'pointermove');

    setRuntimeDispatcher(null);
    __resetToolHandlers();
});

test('keyboard engine normalizes key metadata before routing', () => {
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
    registerToolHandler('select', (input) => ({
        handled: true,
        ...input,
    }));

    const result = handleKeyboardEvent({
        key: 'Delete',
        code: 'Delete',
        repeat: false,
        shiftKey: false,
        ctrlKey: true,
        metaKey: false,
        altKey: false,
    });

    assert.equal(result.type, 'keyboard');
    assert.equal(result.key, 'Delete');
    assert.equal(result.modifiers.ctrl, true);

    setRuntimeDispatcher(null);
    __resetToolHandlers();
});

test('input engine does not execute handlers registered outside approved families', () => {
    __resetToolHandlers();
    const calls = [];
    const dispatcher = {
        getState() {
            return {
                tools: {
                    activeTool: 'synth-brush',
                    registeredTools: {},
                },
            };
        },
    };

    setRuntimeDispatcher(dispatcher);
    registerToolHandler('synth-brush', () => {
        calls.push('called');
        return { handled: true };
    });

    const result = handleInputEvent({ type: 'pointerdown' });

    assert.equal(result, null);
    assert.deepEqual(calls, []);

    setRuntimeDispatcher(null);
    __resetToolHandlers();
});
