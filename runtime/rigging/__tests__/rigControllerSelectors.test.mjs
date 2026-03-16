import test from 'node:test';
import assert from 'node:assert/strict';

import {
    projectRigControllerTimelineTracks,
    selectActiveRigController,
} from '@/runtime/projection/selectors/rigControllerSelectors.js';

test('projectRigControllerTimelineTracks projects deterministic controller track groups from document rigs and motion', () => {
    const snapshot = {
        document: {
            rigs: [
                {
                    id: 'rigA',
                    label: 'Rig A',
                    controllers: [
                        {
                            id: 'head_CTRL',
                            label: 'Head_CTRL',
                            nodeId: 'head_joint',
                            channels: ['rotateY', 'rotateX'],
                        },
                    ],
                },
            ],
            motion: {
                head_joint: {
                    rotateX: {
                        keyframes: [
                            { id: 'late', frame: 12, value: 30 },
                            { id: 'early', frame: 0, value: 0 },
                        ],
                    },
                },
            },
        },
    };

    const result = projectRigControllerTimelineTracks(snapshot);

    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'rig:rigA');
    assert.equal(result[0].kind, 'rig-group');
    assert.equal(result[0].tracks.length, 1);

    const controllerGroup = result[0].tracks[0];
    assert.equal(controllerGroup.id, 'controller:head_CTRL');
    assert.equal(controllerGroup.kind, 'controller-group');
    assert.equal(controllerGroup.tracks.length, 2);
    assert.equal(controllerGroup.tracks[0].id, 'controller:head_CTRL:rotateY');
    assert.equal(controllerGroup.tracks[1].id, 'controller:head_CTRL:rotateX');
    assert.deepEqual(
        controllerGroup.tracks[1].keyframes.map((keyframe) => keyframe.id),
        ['early', 'late']
    );
});

test('projectRigControllerTimelineTracks accepts object-backed rigs and controllers without mutating order', () => {
    const snapshot = {
        document: {
            rigs: {
                rigs: {
                    rigA: {
                        id: 'rigA',
                        controllers: {
                            root_CTRL: {
                                id: 'root_CTRL',
                                nodeRef: 'root_joint',
                                channels: {
                                    translateX: true,
                                    translateY: true,
                                },
                            },
                        },
                    },
                },
            },
            motion: {
                root_joint: {
                    translateX: {
                        keyframes: [{ frame: 4, value: 10 }],
                    },
                },
            },
        },
    };

    const result = projectRigControllerTimelineTracks(snapshot);
    const controllerTracks = result[0].tracks[0].tracks;

    assert.equal(controllerTracks.length, 2);
    assert.equal(controllerTracks[0].channel, 'translateX');
    assert.equal(controllerTracks[1].channel, 'translateY');
    assert.equal(controllerTracks[0].keyframes[0].frame, 4);
    assert.deepEqual(controllerTracks[1].keyframes, []);
});

test('selectActiveRigController finds the selected controller across document rigs', () => {
    const snapshot = {
        document: {
            rigs: [
                {
                    id: 'rigA',
                    controllers: [{ id: 'hip_CTRL' }],
                },
                {
                    id: 'rigB',
                    controllers: [{ id: 'hand_CTRL', label: 'Hand CTRL' }],
                },
            ],
        },
    };

    const controller = selectActiveRigController(snapshot, {
        type: 'rig-controller',
        controllerId: 'hand_CTRL',
    });

    assert.deepEqual(controller, {
        id: 'hand_CTRL',
        label: 'Hand CTRL',
    });
});
