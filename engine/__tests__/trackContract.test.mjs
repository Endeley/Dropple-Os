import { createTrack, hashTrack } from '../../domain/timeline/TrackContract.js';

const trackA = createTrack({
    id: 't1',
    order: 1,
    channelIds: ['b', 'a', 'c'],
});

const trackB = createTrack({
    id: 't1',
    order: 1,
    channelIds: ['c', 'b', 'a'],
});

console.log('HASH A:', hashTrack(trackA));
console.log('HASH B:', hashTrack(trackB));
console.log('STRUCTURALLY EQUAL:', hashTrack(trackA) === hashTrack(trackB));

const trackC = createTrack({
    id: 't1',
    order: 1,
    channelIds: ['a', 'a', 'b'],
});

const trackD = createTrack({
    id: 't1',
    order: 1,
    channelIds: ['b', 'a'],
});

console.log(
    'DUPLICATE COLLAPSE:',
    hashTrack(trackC) === hashTrack(trackD)
);

const trackE = createTrack({
    id: 't1',
    order: 1.9,
    channelIds: ['a'],
});

const trackF = createTrack({
    id: 't1',
    order: 1,
    channelIds: ['a'],
});

console.log(
    'ORDER CANONICAL:',
    hashTrack(trackE) === hashTrack(trackF)
);

const trackG = createTrack({
    id: 't1',
    order: 1,
    channelIds: ['a'],
    meta: {},
});

const trackH = createTrack({
    id: 't1',
    order: 1,
    channelIds: ['a'],
});

console.log(
    'META STABLE:',
    hashTrack(trackG) === hashTrack(trackH)
);
