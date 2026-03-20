import test from 'node:test';
import assert from 'node:assert/strict';
import {
    __resetToolHandlers,
    getToolHandler,
    registerToolHandler,
    unregisterToolHandler,
} from '@/runtime/tools/toolController.js';

test('tool controller registers and resolves handlers by tool id', () => {
    __resetToolHandlers();
    const handler = () => 'ok';

    registerToolHandler('select', handler);

    assert.equal(getToolHandler('select'), handler);
});

test('tool controller unregister removes handlers', () => {
    __resetToolHandlers();
    const handler = () => 'ok';

    registerToolHandler('select', handler);
    unregisterToolHandler('select');

    assert.equal(getToolHandler('select'), null);
});
