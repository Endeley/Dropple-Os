import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createRig,
    createRigController,
} from '../rigRegistry.js';
import {
    projectRigControllerOverlayNodes,
    projectRigControllerTimelineTracks,
} from '@/runtime/projection/selectors/rigSelectors.js';

test('projectRigControllerTimelineTracks maps controller channels to motion-backed timeline tracks', () => {
    const rig = createRig({
        id: 'hero-rig',
        controllers: {
            hand: createRigController({
                id: 'hand',
                label: 'Hand',
                nodeRef: 'hand-node',
                channels: ['transform.x', 'rotation'],
            }),
        },
    });

    const tracks = projectRigControllerTimelineTracks(rig, {
        clips: {
            clip1: {
                id: 'clip1',
                target: 'hand-node',
                property: 'transform.x',
                keyframes: [{ id: 'kf-1', t: 24, v: 120, easing: 'ease-out' }],
            },
        },
    });

    assert.equal(tracks.length, 2);
    assert.equal(tracks[0].controllerId, 'hand');
    assert.equal(tracks[0].clipId, 'clip1');
    assert.equal(tracks[0].keyframes[0].time, 24);
    assert.equal(tracks[1].clipId, null);
});

test('projectRigControllerOverlayNodes projects controller chips from node transforms', () => {
    const rig = createRig({
        id: 'hero-rig',
        controllers: {
            root: createRigController({
                id: 'root',
                label: 'Root',
                nodeRef: 'root-node',
                channels: ['transform.x'],
            }),
        },
    });

    const overlay = projectRigControllerOverlayNodes(rig, {
        'root-node': {
            props: {
                transform: {
                    x: 180,
                    y: 96,
                },
            },
        },
    });

    assert.deepEqual(overlay, [
        {
            id: 'root',
            label: 'Root',
            nodeRef: 'root-node',
            x: 180,
            y: 96,
        },
    ]);
});
