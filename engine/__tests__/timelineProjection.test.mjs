import { projectTimeline } from '../../projection/timelineProjection.js';

const timeline = {
    duration: 120,
    tracks: [
        { id: 't2', type: 'standard', order: 5, channelIds: ['b'] },
        { id: 't1', type: 'standard', order: 0, channelIds: ['a'] },
    ],
};

const projection = projectTimeline(timeline);

console.log(
    'INDEX DENSE:',
    projection.tracks[0].index === 0 && projection.tracks[1].index === 1
);

console.log(
    'CHANNEL MAP CORRECT:',
    projection.channelToTrackMap.get('a') === 't1' &&
        projection.channelToTrackMap.get('b') === 't2'
);

const original = {
    duration: 100,
    tracks: [
        { id: 'x', type: 'standard', order: 0, channelIds: ['a'] },
    ],
};

const snapshot = JSON.stringify(original);

projectTimeline(original);

console.log(
    'IMMUTABLE INPUT:',
    JSON.stringify(original) === snapshot
);

const timelineA = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['b', 'a'] },
    ],
};

const timelineB = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['a', 'b', 'b'] },
    ],
};

const projA = projectTimeline(timelineA);
const projB = projectTimeline(timelineB);

console.log(
    'STRUCTURAL PROJECTION STABLE:',
    JSON.stringify(projA) === JSON.stringify(projB)
);
