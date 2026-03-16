import test from 'node:test';
import assert from 'node:assert/strict';

import { projectRigControllerOverlayNodes } from '@/runtime/projection/selectors/rigControllerOverlaySelectors.js';

test('projectRigControllerOverlayNodes projects overlay nodes from rig controllers and computed transforms', () => {
    const snapshot = {
        document: {
            rigs: [
                {
                    id: 'rigA',
                    controllers: [
                        {
                            id: 'head_CTRL',
                            label: 'Head CTRL',
                            nodeId: 'head',
                        },
                    ],
                },
            ],
        },
        runtime: {
            scene: {
                computed: {
                    transforms: {
                        head: { x: 100, y: 200, rotation: 15 },
                    },
                },
            },
        },
    };

    const result = projectRigControllerOverlayNodes(snapshot);

    assert.equal(result.length, 1);
    assert.equal(result[0].controllerId, 'head_CTRL');
    assert.equal(result[0].label, 'Head CTRL');
    assert.equal(result[0].x, 100);
    assert.equal(result[0].y, 200);
    assert.equal(result[0].rotation, 15);
});

test('projectRigControllerOverlayNodes preserves canonical rig/controller order and filters missing transforms', () => {
    const snapshot = {
        document: {
            rigs: [
                {
                    id: 'rigA',
                    controllers: [
                        { id: 'root_CTRL', nodeRef: 'root' },
                        { id: 'hip_CTRL', nodeRef: 'hip' },
                    ],
                },
                {
                    id: 'rigB',
                    controllers: [
                        { id: 'hand_CTRL', nodeRef: 'hand' },
                    ],
                },
            ],
        },
        runtime: {
            scene: {
                computed: {
                    transforms: {
                        hip: { x: 10, y: 20 },
                        hand: { x: 30, y: 40 },
                    },
                },
            },
        },
    };

    const result = projectRigControllerOverlayNodes(snapshot);

    assert.deepEqual(
        result.map((entry) => entry.controllerId),
        ['hip_CTRL', 'hand_CTRL']
    );
});
