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
    Object.keys(controller.snapshotGraph.nodes).length === 1
);

// Real change: add track
controller = dispatchTrack(controller, {
    type: TrackActions.ADD_TRACK,
    payload: { id: 't1', type: 'standard' },
});

const current = controller.snapshotGraph.nodes[controller.headId];
const parentId = current?.parentIds?.[0];
const parent = parentId ? controller.snapshotGraph.nodes[parentId] : null;
const hasDiff = Boolean(current && current.diffFromParent && parent);

console.log('DIFF ATTACHED:', hasDiff === true);
