import { runExportStabilityGate } from '../../engine/export/exportStabilityGate.js';

const timeline = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['opacity'] },
    ],
    channels: [
        { id: 'opacity', keyframes: [{ time: 0, value: 1 }] },
    ],
};

const shotTimeline = {
    shots: [
        {
            id: 'shotA',
            startMs: 0,
            endMs: 1000,
            timeline,
        },
    ],
};

const sceneGraph = {
    id: 'root',
    type: 'frame',
    channels: { opacity: 1 },
    children: [],
};

const stable = runExportStabilityGate({
    timeline,
    shotTimeline,
    sceneGraph,
});

console.log('STABLE ALLOWED:', stable.allowed === true);

const drift = runExportStabilityGate({
    timeline,
    shotTimeline,
    sceneGraph,
    presentHash: 'bad',
});

console.log('STRUCTURAL DRIFT BLOCKED:', drift.allowed === false && drift.structuralDrift === true);

let flip = false;
const nondeterministic = runExportStabilityGate({
    timeline,
    shotTimeline,
    sceneGraph,
    frames: [0],
    evaluateShotAtFn: (...args) => {
        flip = !flip;
        if (flip) {
            return { evaluatedScene: { id: 'a', type: 'frame', opacity: 1, children: [] } };
        }
        return { evaluatedScene: { id: 'a', type: 'frame', opacity: 0, children: [] } };
    },
});

console.log('EVAL DRIFT BLOCKED:', nondeterministic.allowed === false && nondeterministic.evaluationDrift === true);
