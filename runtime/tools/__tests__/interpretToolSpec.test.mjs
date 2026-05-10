import test from 'node:test';
import assert from 'node:assert/strict';
import {
    APPROVED_TOOL_HANDLER_FAMILIES,
    interpretToolSpec,
} from '@/runtime/tools/interpretToolSpec.js';

test('interpretToolSpec deterministically normalizes create-node tool specs', () => {
    const a = interpretToolSpec({
        id: 'frame',
        label: ' Frame ',
        group: 'create',
        createsNode: true,
        nodeType: 'frame',
        intentTopics: ['node/create', 'node/create', ' canvas/focus '],
        capabilityTags: ['author', 'layout', 'author'],
    });
    const b = interpretToolSpec({
        capabilityTags: ['layout', 'author'],
        intentTopics: [' canvas/focus ', 'node/create'],
        nodeType: 'frame',
        createsNode: true,
        group: 'create',
        label: 'Frame',
        id: 'frame',
    });

    assert.deepEqual(a, b);
    assert.equal(a.handlerFamily, 'createNode');
    assert.deepEqual(a.intentTopics, ['canvas/focus', 'node/create']);
    assert.deepEqual(a.capabilityTags, ['author', 'layout']);
    assert.deepEqual(a.handlerPayload, { nodeType: 'frame' });
    assert.equal(Object.isFrozen(a), true);
    assert.equal(Object.isFrozen(a.intentTopics), true);
    assert.equal(Object.isFrozen(a.handlerPayload), true);
});

test('interpretToolSpec normalizes session tools into the approved session family', () => {
    const interpreted = interpretToolSpec({
        id: 'move',
        label: 'Move',
        group: 'edit',
    });

    assert.equal(interpreted.handlerFamily, 'session');
    assert.deepEqual(interpreted.handlerPayload, { sessionType: 'move' });
});

test('interpretToolSpec keeps utility tools intent-only and authority-free', () => {
    const interpreted = interpretToolSpec({
        id: 'select',
        label: 'Select',
        group: 'navigate',
        metadata: {
            ignored: true,
        },
        authorityFn() {
            throw new Error('should never be preserved');
        },
    });

    assert.equal(interpreted.handlerFamily, 'utility');
    assert.deepEqual(interpreted.handlerPayload, {});
    assert.equal(Object.prototype.hasOwnProperty.call(interpreted, 'authorityFn'), false);
});

test('interpretToolSpec rejects unsupported handler families', () => {
    assert.throws(
        () =>
            interpretToolSpec({
                id: 'synth',
                label: 'Synth',
                handlerFamily: 'dispatcher',
            }),
        /unsupported handlerFamily/,
    );
});

test('interpretToolSpec rejects create-node specs without nodeType', () => {
    assert.throws(
        () =>
            interpretToolSpec({
                id: 'shape',
                label: 'Shape',
                handlerFamily: 'createNode',
            }),
        /nodeType/,
    );
});

test('approved interpreted tool handler families stay constitutionally bounded', () => {
    assert.deepEqual(APPROVED_TOOL_HANDLER_FAMILIES, ['createNode', 'session', 'utility']);
});
