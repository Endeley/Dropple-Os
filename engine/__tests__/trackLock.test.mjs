import { createTimelineController, dispatchTrack } from '../../engine/timeline/timelineController.js';
import { TrackActions } from '../../engine/timeline/trackDispatcher.js';

const base = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, type: 'standard', meta: { locked: true }, channelIds: [] },
        { id: 't2', order: 1, type: 'standard', channelIds: [] },
    ],
    channels: [],
};

let controller = createTimelineController(base);

controller = dispatchTrack(controller, {
    type: TrackActions.ASSIGN_CHANNEL,
    payload: { trackId: 't1', channelId: 'a' },
});

console.log('LOCK BLOCKS ASSIGN:', Object.keys(controller.snapshotGraph.nodes).length === 1);

controller = dispatchTrack(controller, {
    type: TrackActions.REORDER_TRACK,
    payload: { id: 't2', toIndex: 0 },
});

console.log('LOCK BLOCKS REORDER:', Object.keys(controller.snapshotGraph.nodes).length === 1);

controller = dispatchTrack(controller, {
    type: TrackActions.REMOVE_TRACK,
    payload: { id: 't1' },
});

console.log('LOCK BLOCKS REMOVE:', Object.keys(controller.snapshotGraph.nodes).length === 1);

controller = dispatchTrack(controller, {
    type: TrackActions.TOGGLE_TRACK_LOCK,
    payload: { id: 't1' },
});

controller = dispatchTrack(controller, {
    type: TrackActions.ASSIGN_CHANNEL,
    payload: { trackId: 't1', channelId: 'a' },
});

const unlockedTrack =
    controller.snapshotGraph.nodes[controller.headId].timeline.tracks.find((track) => track.id === 't1');

console.log(
    'UNLOCK ALLOWS ASSIGN:',
    Object.keys(controller.snapshotGraph.nodes).length >= 2 && unlockedTrack?.channelIds?.includes('a')
);
