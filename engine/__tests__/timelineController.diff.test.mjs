import {
    createTimelineController,
    dispatchTrack,
} from '../../engine/timeline/timelineController.js';

import { TrackActions } from '../../engine/timeline/trackDispatcher.js';

const base = {
    duration: 100,
    tracks: [],
    channels: [],
};

let controller = createTimelineController(base);

// No-op: remove non-existent track
controller = dispatchTrack(controller, {
    type: TrackActions.REMOVE_TRACK,
    payload: { id: 'x' },
});

console.log(
    'NO OP NO DIFF:',
    controller.history.past.length === 0
);

// Real change: add track
controller = dispatchTrack(controller, {
    type: TrackActions.ADD_TRACK,
    payload: { id: 't1', type: 'standard' },
});

const last = controller.history.past[controller.history.past.length - 1];
const hasDiff = Boolean(last && last.diff);

console.log('DIFF ATTACHED:', hasDiff === true);
