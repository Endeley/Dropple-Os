import {
    createTimelineController,
    dispatchTrack,
    undoTimeline,
    redoTimeline,
} from '../../engine/timeline/timelineController.js';

import { TrackActions } from '../../engine/timeline/trackDispatcher.js';
import { hashTimeline } from '../../domain/timeline/TimelineContract.js';

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
    Object.keys(controller.snapshotGraph.nodes).length === 1
);

controller = dispatchTrack(controller, {
    type: TrackActions.ADD_TRACK,
    payload: { id: 't1', type: 'standard' },
});

console.log(
    'CHANGE RECORDED:',
    Object.keys(controller.snapshotGraph.nodes).length === 2
);

const hashAfterAdd = hashTimeline(
    controller.snapshotGraph.nodes[controller.headId].timeline
);

controller = undoTimeline(controller);

console.log(
    'UNDO WORKS:',
    hashTimeline(controller.snapshotGraph.nodes[controller.headId].timeline) !== hashAfterAdd
);

controller = redoTimeline(controller);

console.log(
    'REDO WORKS:',
    hashTimeline(controller.snapshotGraph.nodes[controller.headId].timeline) === hashAfterAdd
);
