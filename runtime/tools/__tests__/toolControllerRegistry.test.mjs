import test from 'node:test';
import assert from 'node:assert/strict';
import {
    __resetToolHandlers,
    getToolHandler,
    getToolHandlerFamily,
    registerToolHandler,
    unregisterToolHandler,
} from '@/runtime/tools/toolController.js';

test('tool controller registers and resolves handlers by tool id', () => {
    __resetToolHandlers();
    const handler = () => 'ok';

    registerToolHandler('select', handler);

    assert.equal(getToolHandler('select'), handler);
    assert.equal(getToolHandlerFamily('select'), 'utility');
});

test('tool controller unregister removes handlers', () => {
    __resetToolHandlers();
    const handler = () => 'ok';

    registerToolHandler('select', handler);
    unregisterToolHandler('select');

    assert.equal(getToolHandler('select'), null);
});

test('tool controller rejects handlers without a bounded family', () => {
    __resetToolHandlers();
    const handler = () => 'ok';

    registerToolHandler('synth-brush', handler);

    assert.equal(getToolHandler('synth-brush'), null);
    assert.equal(getToolHandlerFamily('synth-brush'), null);
});

test('tool controller accepts explicitly bounded interpreted tool handlers', () => {
    __resetToolHandlers();
    const handler = () => 'ok';

    registerToolHandler('synth-brush', handler, { family: 'utility' });

    assert.equal(getToolHandler('synth-brush'), handler);
    assert.equal(getToolHandlerFamily('synth-brush'), 'utility');
});
