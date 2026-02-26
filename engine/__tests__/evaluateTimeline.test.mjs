import { evaluateTimeline } from '../../engine/timeline/evaluateTimeline.js';

const timeline = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, type: 'standard', channelIds: ['x'] },
        { id: 't2', order: 1, type: 'overlay', channelIds: ['x'] },
    ],
};

function evaluateChannel(id, time) {
    if (id === 'x') return time;
    return 0;
}

function blend(a, b) {
    return a + b;
}

const result = evaluateTimeline(timeline, 5, evaluateChannel, blend);

console.log('OVERLAY OVERRIDES:', result.x === 5);
