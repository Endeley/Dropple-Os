import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveBlueprintCompositionFromCatalog } from '@/runtime/blueprints/resolveBlueprintCompositionFromCatalog.js';
import { verifyBlueprintCertification } from '@/runtime/blueprints/installBlueprint.js';

test('blueprint composition catalog resolver is deterministic for identical ordered entries', () => {
    const left = resolveBlueprintCompositionFromCatalog({
        entries: ['bp.startup.v1', 'bp.logistics.v1'],
    });
    const right = resolveBlueprintCompositionFromCatalog({
        entries: ['bp.startup.v1', 'bp.logistics.v1'],
    });

    assert.equal(verifyBlueprintCertification(left.blueprint), true);
    assert.deepEqual(left.blueprint, right.blueprint);
    assert.equal(left.compositionHash, right.compositionHash);
    assert.equal(left.entries.length, 2);
});

test('blueprint composition catalog resolver fails closed on invalid entries', () => {
    assert.throws(
        () =>
            resolveBlueprintCompositionFromCatalog({
                entries: ['bp.unknown.v1'],
            }),
        /unknown blueprint id/,
    );
});
