import test from 'node:test';
import assert from 'node:assert/strict';

import { assertExclusiveInitialBootSources } from '../persistenceBootSources.js';

test('PersistenceBridge allows descriptor-first boot when no snapshot sources are present', () => {
    const result = assertExclusiveInitialBootSources({
        initialEnvironmentDescriptor: {
            environmentId: 'env-1',
        },
        initialRuntimeSnapshot: null,
        initialEvents: [],
        initialCursorIndex: -1,
    });

    assert.equal(result.hasInitialEnvironmentDescriptor, true);
    assert.equal(result.hasInitialRuntimeSnapshot, null);
    assert.equal(result.hasInitialEvents, false);
    assert.equal(result.hasExplicitCursor, false);
});

test('PersistenceBridge rejects mixed descriptor and snapshot boot sources', () => {
    assert.throws(
        () =>
            assertExclusiveInitialBootSources({
                initialEnvironmentDescriptor: { environmentId: 'env-1' },
                initialRuntimeSnapshot: { document: {} },
                initialEvents: [],
                initialCursorIndex: -1,
            }),
        /cannot boot from both descriptor and snapshot sources/,
    );

    assert.throws(
        () =>
            assertExclusiveInitialBootSources({
                initialEnvironmentDescriptor: { environmentId: 'env-1' },
                initialRuntimeSnapshot: null,
                initialEvents: [{ type: 'noop' }],
                initialCursorIndex: -1,
            }),
        /cannot boot from both descriptor and snapshot sources/,
    );
});
