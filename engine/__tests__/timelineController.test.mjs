import {
    createTimelineController,
    dispatchTrack,
    undoTimeline,
    redoTimeline,
} from '../../engine/timeline/timelineController.js';

import { TrackActions } from '../../engine/timeline/trackDispatcher.js';

const base = {
    duration: 100,
    tracks: [],
    channels: [],
};

let controller = createTimelineController(base);

controller = dispatchTrack(controller, {
    type: TrackActions.REMOVE_TRACK,
    payload: { id: 'x' },
});

console.log(
    'NO OP NOT RECORDED:',
    controller.history.past.length === 0
);

controller = dispatchTrack(controller, {
    type: TrackActions.ADD_TRACK,
    payload: { id: 't1', type: 'standard' },
});

console.log(
    'CHANGE RECORDED:',
    controller.history.past.length === 1
);

const hashAfterAdd = controller.history.presentHash;

controller = undoTimeline(controller);

console.log(
    'UNDO WORKS:',
    controller.history.presentHash !== hashAfterAdd
);

controller = redoTimeline(controller);

console.log(
    'REDO WORKS:',
    controller.history.presentHash === hashAfterAdd
);
