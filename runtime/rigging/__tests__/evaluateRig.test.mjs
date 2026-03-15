import test from 'node:test';
import assert from 'node:assert/strict';

import { createRig, createRigConstraint } from '../rigRegistry.js';
import { evaluateRig } from '../evaluation/evaluateRig.js';

test('evaluateRig applies parent constraints deterministically from controller values', () => {
    const rig = createRig({
        id: 'hero-rig',
        rootNode: 'hero-node',
        constraints: {
            handFollow: createRigConstraint({
                id: 'handFollow',
                type: 'parent',
                parentControllerId: 'ctrl-hand',
                childNode: 'hand-bone',
            }),
        },
    });

    const result = evaluateRig({
        rig,
        controllerValues: {
            'ctrl-hand': {
                x: 120,
                y: 40,
                rotation: 18,
            },
        },
        nodeTransforms: {
            'hand-bone': {
                x: 0,
                y: 0,
                rotation: 0,
            },
        },
    });

    assert.equal(result.rigId, 'hero-rig');
    assert.deepEqual(result.constrainedNodes['hand-bone'], {
        x: 120,
        y: 40,
        rotation: 18,
    });
});
