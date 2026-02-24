import { evaluateShotAt } from './evaluateShotAt.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const scene = {
    id: 'root',
    type: 'frame',
    transform: { x: 10, y: 5 },
    children: [
        {
            id: 'child',
            type: 'rect',
            transform: { x: 2, y: 3 },
            children: [],
        },
    ],
};

const timeline = {
    shots: [
        { id: 'shotA', startMs: 0, endMs: 1000 },
        { id: 'shotB', startMs: 1000, endMs: 2000 },
    ],
};

// Case 1: auto-select by time
const autoResult = evaluateShotAt(timeline, scene, 1200);
assert(autoResult.ok === true, 'auto-select failed: ok=false');
assert(autoResult.shotId === 'shotB', 'auto-select failed: wrong shot');
assert(autoResult.shotTimeMs === 200, 'auto-select failed: wrong shotTimeMs');

// Case 2: activeShotId override
const activeTimeline = {
    ...timeline,
    activeShotId: 'shotA',
};
const activeResult = evaluateShotAt(activeTimeline, scene, 1500);
assert(activeResult.ok === true, 'activeShotId failed: ok=false');
assert(activeResult.shotId === 'shotA', 'activeShotId failed: wrong shot');
assert(activeResult.shotTimeMs === 1000, 'activeShotId failed: shotTimeMs clamp');

// Case 3: shot camera override
const cameraTimeline = {
    shots: [
        {
            id: 'shotC',
            startMs: 0,
            endMs: 1000,
            cameraTransform: { x: 5, y: 2 },
        },
    ],
};
const cameraResult = evaluateShotAt(cameraTimeline, scene, 500);
assert(cameraResult.ok === true, 'camera override failed: ok=false');
const root = cameraResult.evaluatedScene;
assert(
    root.viewTransform.x === root.worldTransform.x - 5 &&
        root.viewTransform.y === root.worldTransform.y - 2,
    'camera override failed: root viewTransform mismatch'
);
const child = root.children[0];
assert(
    child.viewTransform.x === child.worldTransform.x - 5 &&
        child.viewTransform.y === child.worldTransform.y - 2,
    'camera override failed: child viewTransform mismatch'
);

// Case 4: timeOffsetMs
const offsetTimeline = {
    shots: [
        { id: 'shotD', startMs: 0, endMs: 1000, timeOffsetMs: 100 },
    ],
};
const offsetResult = evaluateShotAt(offsetTimeline, scene, 0);
assert(offsetResult.ok === true, 'timeOffset failed: ok=false');
assert(offsetResult.shotTimeMs === 100, 'timeOffset failed: shotTimeMs mismatch');

// Case 5: no shot
const noShotResult = evaluateShotAt(timeline, scene, 3000);
assert(noShotResult.ok === false, 'no-shot failed: expected ok=false');
assert(noShotResult.reason === 'NO_SHOT', 'no-shot failed: wrong reason');

console.log('evaluateShotAt deterministic fixture: OK');
