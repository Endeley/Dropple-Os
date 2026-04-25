import { buildEvaluationInputs } from './buildEvaluationInputs.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const runtimeState = {
    document: {
        sceneGraph: {
            rootIds: ['root', 'other-root'],
            nodes: {
                root: { id: 'root', type: 'frame', children: ['childA', 'childB'] },
                childA: { id: 'childA', type: 'rect', children: [] },
                childB: { id: 'childB', type: 'rect', children: [] },
                'other-root': { id: 'other-root', type: 'frame', children: ['other-child'] },
                'other-child': { id: 'other-child', type: 'rect', children: [] },
            },
            activeSceneId: 'scene1',
            activeShotId: 'shotB',
            scenes: [
                {
                    id: 'scene1',
                    shots: [
                        {
                            id: 'shotA',
                            start: 0,
                            duration: 1000,
                            compositionId: 'root',
                            camera: {
                                keyframes: [
                                    { time: 0, x: 0, y: 0, zoom: 1 },
                                    { time: 1000, x: 10, y: 20, zoom: 1 },
                                ],
                            },
                        },
                        {
                            id: 'shotB',
                            start: 1000,
                            duration: 1000,
                            compositionId: 'root',
                        },
                    ],
                },
            ],
        },
    },
    scene: {
        activeSceneId: 'scene1',
        activeShotId: 'shotA',
    },
};

const before = JSON.stringify(runtimeState);
const result = buildEvaluationInputs(runtimeState);
const after = JSON.stringify(runtimeState);

assert(before === after, 'runtimeState mutated');

assert(result.sceneGraphTree && typeof result.sceneGraphTree === 'object', 'sceneGraphTree should be singular root object');
assert(!Array.isArray(result.sceneGraphTree), 'sceneGraphTree must not be array-wrapped');
assert(result.sceneGraphTree.id === 'root', 'root id mismatch');
assert(result.sceneGraphTree.children[0].id === 'childA', 'child order mismatch: childA');
assert(result.sceneGraphTree.children[1].id === 'childB', 'child order mismatch: childB');
assert(result.sceneGraphTree.id !== 'other-root', 'sceneGraphTree should exclude inactive scene root');

assert(result.shotTimeline.shots.length === 2, 'shotTimeline length mismatch');
assert(result.shotTimeline.shots[0].startMs === 0, 'shotA startMs mismatch');
assert(result.shotTimeline.shots[0].endMs === 1000, 'shotA endMs mismatch');
assert(result.shotTimeline.shots[1].startMs === 1000, 'shotB startMs mismatch');
assert(result.shotTimeline.shots[1].endMs === 2000, 'shotB endMs mismatch');
assert(result.activeSceneId === 'scene1', 'activeSceneId mismatch');

const camera = result.shotTimeline.shots[0].cameraTransform;
assert(camera && camera.x && camera.y, 'cameraTransform missing');
assert(camera.x.keyframes[0].t === 0 && camera.x.keyframes[0].v === 0, 'camera x keyframe[0] mismatch');
assert(camera.x.keyframes[1].t === 1000 && camera.x.keyframes[1].v === 10, 'camera x keyframe[1] mismatch');
assert(camera.y.keyframes[0].t === 0 && camera.y.keyframes[0].v === 0, 'camera y keyframe[0] mismatch');
assert(camera.y.keyframes[1].t === 1000 && camera.y.keyframes[1].v === 20, 'camera y keyframe[1] mismatch');

assert(result.activeShotId === 'shotA', 'activeShotId precedence mismatch');

const conflictingRuntimeState = {
    ...runtimeState,
    document: {
        ...runtimeState.document,
        sceneGraph: {
            ...runtimeState.document.sceneGraph,
            activeSceneId: 'scene2',
            scenes: [
                ...runtimeState.document.sceneGraph.scenes,
                {
                    id: 'scene2',
                    shots: [{ id: 'shotC', start: 0, duration: 500, compositionId: 'other-root' }],
                },
            ],
        },
    },
};
const conflictResult = buildEvaluationInputs(conflictingRuntimeState);

assert(conflictResult.activeSceneId === 'scene1', 'runtime activeSceneId must win over document');
assert(conflictResult.shotTimeline.shots.length === 2, 'shotTimeline should stay scoped to runtime active scene');
assert(conflictResult.sceneGraphTree.id === 'root', 'sceneGraphTree must stay scoped to runtime active scene');

console.log('buildEvaluationInputs deterministic fixture: OK');
