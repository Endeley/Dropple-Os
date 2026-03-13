import test from 'node:test';
import assert from 'node:assert/strict';

import { assertReducerOwnership } from '@/core/events/reducerOwnership.js';

test('reducer ownership rejects foreign document slice mutation', () => {
    const previous = {
        document: {
            vectors: {},
            layout: {},
        },
        vectors: {},
    };

    const next = {
        document: {
            vectors: {},
            layout: { dirty: true },
        },
        vectors: {},
    };

    assert.throws(
        () =>
            assertReducerOwnership('vectorReducers', previous, next, {
                allowedDocumentSlices: ['vectors'],
                allowedRuntimeSlices: ['vectors'],
            }),
        /foreign document slices: layout/,
    );
});

test('reducer ownership accepts owned document and runtime slice mutation', () => {
    const previous = {
        document: {
            vectors: {},
        },
        vectors: {},
    };

    const next = {
        document: {
            vectors: { rect1: { id: 'rect1' } },
        },
        vectors: { rect1: { id: 'rect1' } },
    };

    assert.doesNotThrow(() =>
        assertReducerOwnership('vectorReducers', previous, next, {
            allowedDocumentSlices: ['vectors'],
            allowedRuntimeSlices: ['vectors'],
        }),
    );
});
