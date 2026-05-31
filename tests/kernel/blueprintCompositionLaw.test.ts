import test from 'node:test';
import assert from 'node:assert/strict';

import { composeBlueprints } from '@/runtime/blueprints/composeBlueprints.js';
import { listBlueprintCatalog } from '@/runtime/blueprints/blueprintCatalog.js';
import { verifyBlueprintCertification } from '@/runtime/blueprints/installBlueprint.js';

function findBlueprint(id) {
    return listBlueprintCatalog().find((blueprint) => blueprint.id === id);
}

test('blueprint composition is deterministic for equivalent ordered inputs', () => {
    const startup = findBlueprint('bp.startup.v1');
    const logistics = findBlueprint('bp.logistics.v1');
    assert.ok(startup);
    assert.ok(logistics);

    const left = composeBlueprints({
        compositionId: 'creative-os-pack-v1',
        name: 'Creative OS Pack',
        blueprints: [startup, logistics],
    });
    const right = composeBlueprints({
        compositionId: 'creative-os-pack-v1',
        name: 'Creative OS Pack',
        blueprints: [startup, logistics],
    });

    assert.deepEqual(left, right);
    assert.equal(verifyBlueprintCertification(left), true);
    assert.equal(left.lineage.rootId, 'bp.compose.creative-os-pack-v1');
    assert.equal(left.seedEvents.length, startup.seedEvents.length + logistics.seedEvents.length);
});

test('blueprint composition merges profiles deterministically with deduplicated sorted values', () => {
    const startup = findBlueprint('bp.startup.v1');
    const startupV2 = findBlueprint('bp.startup.v2');
    assert.ok(startup);
    assert.ok(startupV2);

    const composed = composeBlueprints({
        compositionId: 'startup-stack',
        name: 'Startup Stack',
        blueprints: [startup, startupV2],
    });

    assert.deepEqual(
        composed.workspaceProfiles,
        Object.freeze({
            build: Object.freeze(['application', 'automation']),
            collaborate: Object.freeze(['review']),
            create: Object.freeze(['document', 'graphic', 'uiux']),
        }),
    );
    assert.equal(composed.composition.sourceBlueprintRefs.length, 2);
    assert.equal(composed.composition.sourceBlueprintRefs[0].id, 'bp.startup.v1');
    assert.equal(composed.composition.sourceBlueprintRefs[1].id, 'bp.startup.v2');
});

test('blueprint composition fails closed when input blueprint certification is invalid', () => {
    const startup = findBlueprint('bp.startup.v1');
    assert.ok(startup);
    const tampered = {
        ...startup,
        name: 'Tampered Startup',
    };

    assert.throws(
        () =>
            composeBlueprints({
                compositionId: 'invalid-pack',
                name: 'Invalid Pack',
                blueprints: [tampered],
            }),
        /invalid certification/,
    );
});

