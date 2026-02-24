import { evaluateScene } from './evaluateScene.js';

const scene = {
    id: 'root',
    type: 'frame',
    channels: {
        'transform.x': [
            { t: 0, v: 0 },
            { t: 1000, v: 10 },
        ],
        'transform.y': 5,
        opacity: [
            { time: 0, value: 1, easing: 'linear' },
            { time: 1000, value: 0.5, easing: 'linear' },
        ],
    },
    children: [
        {
            id: 'childA',
            type: 'rect',
            channels: {
                'transform.x': 3,
                'transform.y': 2,
                opacity: 0.5,
            },
            children: [],
        },
        {
            id: 'childB',
            type: 'rect',
            channels: {
                'transform.x': -2,
                'transform.y': 4,
            },
            children: [],
        },
    ],
};

const result = evaluateScene(scene, 500);

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

assert(result && typeof result === 'object', 'evaluateScene returned invalid root');
assert(result.worldTransform.x === 5 && result.worldTransform.y === 5, 'root.worldTransform mismatch');

const [childA, childB] = result.children || [];

assert(childA?.id === 'childA', 'child order mismatch at index 0');
assert(childB?.id === 'childB', 'child order mismatch at index 1');

assert(childA.worldTransform.x === 8 && childA.worldTransform.y === 7, 'childA.worldTransform mismatch');
assert(childA.opacity === 0.375, 'childA.opacity mismatch');

assert(childB.worldTransform.x === 3 && childB.worldTransform.y === 9, 'childB.worldTransform mismatch');
assert(childB.opacity === 0.75, 'childB.opacity mismatch');

const cameraResult = evaluateScene(scene, 500, { cameraTransform: { x: 5, y: 2, scale: 1 } });
assert(
    cameraResult.viewTransform.x === cameraResult.worldTransform.x - 5 &&
        cameraResult.viewTransform.y === cameraResult.worldTransform.y - 2,
    'root.viewTransform mismatch'
);
const [cameraChildA, cameraChildB] = cameraResult.children || [];
assert(
    cameraChildA.viewTransform.x === cameraChildA.worldTransform.x - 5 &&
        cameraChildA.viewTransform.y === cameraChildA.worldTransform.y - 2,
    'childA.viewTransform mismatch'
);
assert(
    cameraChildB.viewTransform.x === cameraChildB.worldTransform.x - 5 &&
        cameraChildB.viewTransform.y === cameraChildB.worldTransform.y - 2,
    'childB.viewTransform mismatch'
);

const keyframedCamera = evaluateScene(scene, 500, {
    cameraTransform: {
        x: {
            keyframes: [
                { t: 0, v: 0 },
                { t: 1000, v: 10 },
            ],
        },
        y: 0,
        scale: {
            keyframes: [
                { time: 0, value: 1 },
                { time: 1000, value: 2 },
            ],
        },
    },
});
assert(
    keyframedCamera.viewTransform.x === (keyframedCamera.worldTransform.x - 5) * 1.5,
    'keyframed camera scale x mismatch'
);
assert(
    keyframedCamera.viewTransform.y === keyframedCamera.worldTransform.y * 1.5,
    'keyframed camera scale y mismatch'
);

const before = evaluateScene(scene, -100);
assert(before.worldTransform.x === 0, 'clamp before first keyframe failed');
assert(before.opacity === 1, 'opacity clamp before first keyframe failed');

const after = evaluateScene(scene, 2000);
assert(after.worldTransform.x === 10, 'clamp after last keyframe failed');
assert(after.opacity === 0.5, 'opacity clamp after last keyframe failed');

const easeScene = {
    id: 'ease',
    type: 'frame',
    channels: {
        'transform.x': [
            { time: 0, value: 0, easing: 'easeInOut' },
            { time: 1000, value: 10, easing: 'easeInOut' },
        ],
        'transform.y': 0,
    },
    children: [],
};
const easeResult = evaluateScene(easeScene, 500);
assert(easeResult.worldTransform.x === 5, 'easeInOut midpoint mismatch');

let threw = false;
try {
    evaluateScene(
        {
            id: 'bad',
            type: 'frame',
            channels: {
                'transform.x': [
                    { time: 0, value: 0, easing: 'bad' },
                    { time: 1000, value: 10, easing: 'bad' },
                ],
                'transform.y': 0,
            },
            children: [],
        },
        500
    );
} catch (err) {
    threw = true;
}
assert(threw, 'invalid easing should throw');

let unsortedThrew = false;
try {
    evaluateScene(
        {
            id: 'unsorted',
            type: 'frame',
            channels: {
                'transform.x': [
                    { time: 1000, value: 10 },
                    { time: 0, value: 0 },
                ],
                'transform.y': 0,
            },
            children: [],
        },
        500
    );
} catch (err) {
    unsortedThrew = true;
}
assert(unsortedThrew, 'unsorted keyframes should throw');

assertThrows(
    () =>
        evaluateScene(
            {
                id: 'inlineDeprecated',
                type: 'frame',
                transform: {
                    x: { keyframes: [{ time: 0, value: 0 }] },
                    y: 0,
                },
                children: [],
            },
            0
        ),
    'inline keyframes should throw'
);

const channelScene = {
    id: 'channelRoot',
    type: 'frame',
    channels: {
        'transform.x': [
            { time: 0, value: 0 },
            { time: 1000, value: 10 },
        ],
        'transform.y': 2,
        opacity: [
            { time: 0, value: 1 },
            { time: 1000, value: 0.25 },
        ],
    },
    children: [],
};
const channelResult = evaluateScene(channelScene, 500);
assert(channelResult.worldTransform.x === 5, 'channel transform.x mismatch');
assert(channelResult.worldTransform.y === 2, 'channel transform.y mismatch');
assert(channelResult.opacity === 0.625, 'channel opacity mismatch');

function assertThrows(fn, message) {
    let didThrow = false;
    try {
        fn();
    } catch (err) {
        didThrow = true;
    }
    assert(didThrow, message);
}

assertThrows(
    () =>
        evaluateScene(
            {
                id: 'badChannel',
                type: 'frame',
                channels: {
                    'transform.z': [{ time: 0, value: 0 }],
                },
                children: [],
            },
            0
        ),
    'unknown channel key should throw'
);

assertThrows(
    () =>
        evaluateScene(
            {
                id: 'emptyChannel',
                type: 'frame',
                channels: {
                    'transform.x': [],
                },
                children: [],
            },
            0
        ),
    'empty keyframe array should throw'
);

assertThrows(
    () =>
        evaluateScene(
            {
                id: 'duplicateTime',
                type: 'frame',
                channels: {
                    'transform.x': [
                        { time: 0, value: 0 },
                        { time: 0, value: 1 },
                    ],
                },
                children: [],
            },
            0
        ),
    'duplicate keyframe time should throw'
);

assertThrows(
    () =>
        evaluateScene(
            {
                id: 'nonNumericValue',
                type: 'frame',
                channels: {
                    'opacity': [
                        { time: 0, value: 'bad' },
                        { time: 1000, value: 1 },
                    ],
                },
                children: [],
            },
            0
        ),
    'non-numeric value should throw'
);

assertThrows(
    () =>
        evaluateScene(
            {
                id: 'mixedBad',
                type: 'frame',
                channels: {
                    'transform.x': [{ time: 0, value: 0 }],
                    'camera.z': [{ time: 0, value: 0 }],
                },
                children: [],
            },
            0
        ),
    'mixed valid + invalid channels should throw'
);

console.log('evaluateScene deterministic fixture: OK');
