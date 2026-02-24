import {
    dispatchTrackAction,
    TrackActions,
} from '../../engine/timeline/trackDispatcher.js';

const baseTimeline = {
    duration: 100,
    tracks: [],
    channels: [],
};

let timeline = dispatchTrackAction(baseTimeline, {
    type: TrackActions.ADD_TRACK,
    payload: { id: 't1', type: 'standard' },
});

timeline = dispatchTrackAction(timeline, {
    type: TrackActions.ADD_TRACK,
    payload: { id: 't2', type: 'standard' },
});

console.log(
    'ADD DENSE ORDER:',
    timeline.tracks[0].order === 0 && timeline.tracks[1].order === 1
);

timeline = dispatchTrackAction(timeline, {
    type: TrackActions.REORDER_TRACK,
    payload: { id: 't1', toIndex: 1 },
});

console.log(
    'REORDER DENSE:',
    timeline.tracks[0].order === 0 && timeline.tracks[1].order === 1
);

timeline = dispatchTrackAction(timeline, {
    type: TrackActions.ASSIGN_CHANNEL,
    payload: { trackId: 't1', channelId: 'a' },
});

timeline = dispatchTrackAction(timeline, {
    type: TrackActions.ASSIGN_CHANNEL,
    payload: { trackId: 't2', channelId: 'a' },
});

const t1 = timeline.tracks.find((t) => t.id === 't1');
const t2 = timeline.tracks.find((t) => t.id === 't2');

console.log(
    'CHANNEL MOVED NOT DUPED:',
    t1.channelIds.length === 0 && t2.channelIds.includes('a')
);

timeline = dispatchTrackAction(timeline, {
    type: TrackActions.REMOVE_TRACK,
    payload: { id: 't1' },
});

console.log(
    'REMOVE DENSE:',
    timeline.tracks.length === 1 && timeline.tracks[0].order === 0
);

const original = {
    duration: 100,
    tracks: [],
    channels: [],
};

const next = dispatchTrackAction(original, {
    type: TrackActions.ADD_TRACK,
    payload: { id: 'x', type: 'standard' },
});

console.log(
    'IMMUTABLE:',
    original !== next && original.tracks.length === 0
);
