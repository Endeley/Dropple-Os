import test from 'node:test';
import assert from 'node:assert/strict';

import {
    certifyBlueprint,
    verifyBlueprintCertification,
} from '@/runtime/blueprints/installBlueprint.js';

function createBlueprintInput() {
    return {
        id: 'bp.logistics.v1',
        version: 1,
        name: 'Logistics Blueprint',
        description: 'Deterministic logistics universe starter',
        kind: 'project',
        workspaceProfiles: {
            operate: ['systems-engineering', 'enterprise-operations'],
        },
        capabilityProfiles: {
            operate: ['workflow:define', 'ops:process'],
        },
        seedGraph: {
            nodes: {
                hub: { id: 'hub', type: 'frame' },
            },
            rootIds: ['hub'],
        },
        seedEvents: [
            {
                type: 'node/create',
                payload: {
                    node: {
                        id: 'hub',
                        type: 'frame',
                    },
                },
            },
        ],
        workflowPresets: {},
        publishPresets: {},
        lineage: {
            rootId: 'bp.logistics.root',
            versionId: 'bp.logistics.v1',
            parentVersionId: null,
        },
    };
}

test('blueprint certification hash is deterministic for identical payload', () => {
    const blueprint = createBlueprintInput();
    const left = certifyBlueprint(blueprint);
    const right = certifyBlueprint(blueprint);

    assert.equal(left.certification.hash, right.certification.hash);
    assert.equal(verifyBlueprintCertification(left), true);
});

test('blueprint certification fails closed when payload is tampered', () => {
    const certified = certifyBlueprint(createBlueprintInput());
    const tampered = {
        ...certified,
        seedEvents: [
            ...certified.seedEvents,
            {
                type: 'node/create',
                payload: {
                    node: { id: 'tamper', type: 'frame' },
                },
            },
        ],
    };

    assert.equal(verifyBlueprintCertification(certified), true);
    assert.equal(verifyBlueprintCertification(tampered), false);
});
