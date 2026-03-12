import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateData } from '@/runtime/data/index.js';

test('dataRuntime resolves bindings deterministically', () => {
    const document = {
        variables: {
            user: {
                name: 'Endeley',
            },
            layout: {
                sidebarWidth: 240,
            },
        },
        bindings: {
            node1: {
                text: 'user.name',
            },
            node2: {
                width: 'layout.sidebarWidth',
            },
        },
    };

    const next = evaluateData(document, {});

    assert.equal(next.data.resolvedBindings.node1.text, 'Endeley');
    assert.equal(next.data.resolvedBindings.node2.width, 240);
});

test('dataRuntime output is deterministic', () => {
    const document = {
        variables: {
            a: { value: 10 },
        },
        bindings: {
            node: {
                width: 'a.value',
            },
        },
    };

    const runtimeA = evaluateData(document, {});
    const runtimeB = evaluateData(document, {});

    assert.deepEqual(runtimeA.data, runtimeB.data);
});
