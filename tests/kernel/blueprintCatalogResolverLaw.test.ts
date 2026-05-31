import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveBlueprintCatalogEntry } from '@/runtime/blueprints/resolveBlueprintCatalogEntry.js';

test('blueprint catalog resolver returns deterministic certified identity tuple', () => {
    const left = resolveBlueprintCatalogEntry({ blueprintId: 'bp.startup.v1' });
    const right = resolveBlueprintCatalogEntry({ blueprintId: 'bp.startup.v1' });

    assert.equal(left.blueprintId, 'bp.startup.v1');
    assert.equal(left.blueprintVersionId, 'bp.startup.v1');
    assert.equal(typeof left.certificationHash, 'string');
    assert.equal(left.certificationHash.length > 0, true);
    assert.deepEqual(left, right);
});

test('blueprint catalog resolver fails closed on version mismatch', () => {
    assert.throws(
        () =>
            resolveBlueprintCatalogEntry({
                blueprintId: 'bp.startup.v1',
                blueprintVersionId: 'bp.startup.v999',
            }),
        /blueprint version mismatch/,
    );
});

test('blueprint catalog resolver fails closed on certification hash mismatch', () => {
    assert.throws(
        () =>
            resolveBlueprintCatalogEntry({
                blueprintId: 'bp.logistics.v1',
                certificationHash: 'tampered',
            }),
        /certification hash mismatch/,
    );
});

test('blueprint catalog resolver fails closed on unknown blueprint id', () => {
    assert.throws(
        () =>
            resolveBlueprintCatalogEntry({
                blueprintId: 'bp.unknown.v1',
            }),
        /unknown blueprint id/,
    );
});

