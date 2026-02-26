import { diffTimeline } from '../../engine/timeline/diffTimeline.js';

const timelineA = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['a'] },
    ],
};

const timelineB = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['a'] },
    ],
};

const noChange = diffTimeline(timelineA, timelineB);
console.log('NO CHANGE:', noChange.changed === false);

const reordered = {
    duration: 100,
    tracks: [
        { id: 't2', type: 'standard', order: 0, channelIds: ['b'] },
        { id: 't1', type: 'standard', order: 1, channelIds: ['a'] },
    ],
};

const reorderDiff = diffTimeline(timelineA, reordered);
console.log(
    'REORDER DETECTED:',
    reorderDiff.tracks.reordered.length === 1 &&
        reorderDiff.tracks.reordered[0].id === 't1'
);

const movedTimeline = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: [] },
        { id: 't2', type: 'standard', order: 1, channelIds: ['a'] },
    ],
};

const movedDiff = diffTimeline(timelineA, movedTimeline);
console.log(
    'CHANNEL MOVED:',
    movedDiff.channelAssignments.moved.length === 1 &&
        movedDiff.channelAssignments.moved[0].channelId === 'a'
);

const metaTimeline = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['a'], meta: { locked: true } },
    ],
};

const metaDiff = diffTimeline(timelineA, metaTimeline);
console.log(
    'META CHANGED:',
    metaDiff.tracks.metaChanged.length === 1 && metaDiff.tracks.metaChanged[0].key === 'locked'
);

const timelineC = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['b', 'a'] },
    ],
};

const timelineD = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['a', 'b', 'b'] },
    ],
};

const projA = diffTimeline(timelineC, timelineC);
const projB = diffTimeline(timelineD, timelineD);

console.log('OUTPUT STABLE:', JSON.stringify(projA) === JSON.stringify(projB));
