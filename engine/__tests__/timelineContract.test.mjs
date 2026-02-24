import {
    normalizeTimeline,
    hashTimeline,
    validateTimeline,
} from '../../domain/timeline/TimelineContract.js';

const timelineA = {
    duration: 100,
    tracks: [
        { id: 't2', type: 'standard', order: 1, channelIds: ['b'] },
        { id: 't1', type: 'standard', order: 0, channelIds: ['a'] },
    ],
};

const timelineB = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['a'] },
        { id: 't2', type: 'standard', order: 1, channelIds: ['b'] },
    ],
};

console.log(
    'TRACK ORDER STABLE:',
    hashTimeline(timelineA) === hashTimeline(timelineB)
);

const sparseTimeline = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 5, channelIds: ['a'] },
        { id: 't2', type: 'standard', order: 10, channelIds: ['b'] },
    ],
};

const normalized = normalizeTimeline(sparseTimeline);

console.log(
    'DENSE ORDER:',
    normalized.tracks[0].order === 0 && normalized.tracks[1].order === 1
);

const invalidTimeline = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['a'] },
        { id: 't2', type: 'standard', order: 1, channelIds: ['a'] },
    ],
};

let threw = false;

try {
    validateTimeline(invalidTimeline);
} catch (e) {
    threw = true;
}

console.log('DUPLICATION BLOCKED:', threw);

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

console.log(
    'STRUCTURAL HASH STABLE:',
    hashTimeline(timelineC) === hashTimeline(timelineD)
);
