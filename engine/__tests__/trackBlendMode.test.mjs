import { normalizeTrack } from '../../domain/timeline/TrackContract.js';
import { hashTimeline } from '../../domain/timeline/TimelineContract.js';
import { evaluateTimeline } from '../../engine/timeline/evaluateTimeline.js';
import { createTimelineController, dispatchTrack } from '../../engine/timeline/timelineController.js';
import { TrackActions } from '../../engine/timeline/trackDispatcher.js';

const normalized = normalizeTrack({
    id: 't1',
    type: 'standard',
    order: 0,
    channelIds: [],
    meta: {},
});

console.log('DEFAULT BLEND MODE:', normalized.meta.blendMode === 'add');

const invalidMode = normalizeTrack({
    id: 't_invalid',
    type: 'standard',
    order: 0,
    channelIds: [],
    meta: { blendMode: 'weird' },
});

console.log('INVALID MODE COERCED:', invalidMode.meta.blendMode === 'add');

const overlayMode = normalizeTrack({
    id: 't_overlay',
    type: 'overlay',
    order: 0,
    channelIds: [],
    meta: { blendMode: 'add' },
});

console.log('OVERLAY FORCED REPLACE:', overlayMode.meta.blendMode === 'replace');

const timeline = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, type: 'standard', channelIds: ['x'], meta: { blendMode: 'add' } },
        { id: 't2', order: 1, type: 'standard', channelIds: ['x'], meta: { blendMode: 'replace' } },
    ],
    channels: [],
};

const result = evaluateTimeline(
    timeline,
    0,
    () => 2,
    (a, b) => a + b
);

console.log('REPLACE OVERRIDES ADD:', result.x === 2);

const addOrderA = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, type: 'standard', channelIds: ['x'], meta: { blendMode: 'add' } },
        { id: 't2', order: 1, type: 'standard', channelIds: ['x'], meta: { blendMode: 'add' } },
    ],
    channels: [],
};

const addOrderB = {
    duration: 100,
    tracks: [
        { id: 't2', order: 0, type: 'standard', channelIds: ['x'], meta: { blendMode: 'add' } },
        { id: 't1', order: 1, type: 'standard', channelIds: ['x'], meta: { blendMode: 'add' } },
    ],
    channels: [],
};

const addA = evaluateTimeline(addOrderA, 0, () => 2, (a, b) => a + b);
const addB = evaluateTimeline(addOrderB, 0, () => 2, (a, b) => a + b);

console.log('ADD COMMUTATIVE:', addA.x === addB.x);

const replaceOrderA = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, type: 'standard', channelIds: ['x'], meta: { blendMode: 'add' } },
        { id: 't2', order: 1, type: 'standard', channelIds: ['x'], meta: { blendMode: 'replace' } },
    ],
    channels: [],
};

const replaceOrderB = {
    duration: 100,
    tracks: [
        { id: 't2', order: 0, type: 'standard', channelIds: ['x'], meta: { blendMode: 'replace' } },
        { id: 't1', order: 1, type: 'standard', channelIds: ['x'], meta: { blendMode: 'add' } },
    ],
    channels: [],
};

const replaceA = evaluateTimeline(replaceOrderA, 0, () => 2, (a, b) => a + b);
const replaceB = evaluateTimeline(replaceOrderB, 0, () => 2, (a, b) => a + b);

console.log('REPLACE ORDER DETERMINISTIC:', replaceA.x !== replaceB.x);

const evalHashA = JSON.stringify(evaluateTimeline(timeline, 0, () => 2, (a, b) => a + b));
const evalHashB = JSON.stringify(evaluateTimeline(timeline, 0, () => 2, (a, b) => a + b));

console.log('EVALUATION HASH STABLE:', evalHashA === evalHashB);

const blendAdd = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, type: 'standard', channelIds: ['x'], meta: { blendMode: 'add' } },
    ],
    channels: [],
};
const blendReplace = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, type: 'standard', channelIds: ['x'], meta: { blendMode: 'replace' } },
    ],
    channels: [],
};

console.log('BLEND HASH CHANGES STRUCTURE:', hashTimeline(blendAdd) !== hashTimeline(blendReplace));

const lockedBase = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, type: 'standard', channelIds: [], meta: { locked: true } },
    ],
    channels: [],
};

let controller = createTimelineController(lockedBase);

controller = dispatchTrack(controller, {
    type: TrackActions.SET_TRACK_BLEND_MODE,
    payload: { id: 't1', blendMode: 'replace' },
});

console.log('LOCK BLOCKS BLEND CHANGE:', Object.keys(controller.snapshotGraph.nodes).length === 1);

const overlayBase = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, type: 'overlay', channelIds: [], meta: {} },
    ],
    channels: [],
};

let overlayController = createTimelineController(overlayBase);
overlayController = dispatchTrack(overlayController, {
    type: TrackActions.SET_TRACK_BLEND_MODE,
    payload: { id: 't1', blendMode: 'add' },
});

console.log('OVERLAY BLEND REJECTED:', Object.keys(overlayController.snapshotGraph.nodes).length === 1);
