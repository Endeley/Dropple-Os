import { buildEvaluationInputs } from './buildEvaluationInputs.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const runtimeState = {
    document: {
        sceneGraph: {
            rootIds: ['root'],
            nodes: {
                root: { id: 'root', type: 'frame', children: [] },
                'camera-a': {
                    id: 'camera-a',
                    props: {
                        transform: {
                            x: 320,
                            y: 180,
                            scale: 1.25,
                            rotation: 12,
                        },
                    },
                },
            },
            activeSceneId: null,
            activeShotId: null,
            scenes: [],
        },
        sequences: {
            activeSequenceId: 'fight-sequence',
            sequences: {
                'fight-sequence': {
                    id: 'fight-sequence',
                    frameRate: 24,
                    tracks: {
                        camera: {
                            id: 'camera',
                            type: 'camera',
                            clips: {
                                camA: {
                                    id: 'camA',
                                    start: 0,
                                    end: 120,
                                    cameraNodeRef: 'camera-a',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    scene: {
        activeSceneId: null,
        activeShotId: null,
    },
};

const before = JSON.stringify(runtimeState);
const result = buildEvaluationInputs(runtimeState, { timeMs: 1000 });
const after = JSON.stringify(runtimeState);

assert(before === after, 'runtimeState mutated');
assert(result.cameraTransform, 'sequence cameraTransform missing');
assert(result.cameraTransform.nodeRef === 'camera-a', 'sequence camera node mismatch');
assert(result.cameraTransform.x === 320, 'sequence camera x mismatch');
assert(result.cameraTransform.y === 180, 'sequence camera y mismatch');
assert(result.cameraTransform.zoom === 1.25, 'sequence camera zoom mismatch');
assert(result.cameraTransform.rotation === 12, 'sequence camera rotation mismatch');

console.log('buildEvaluationInputs sequence fixture: OK');
