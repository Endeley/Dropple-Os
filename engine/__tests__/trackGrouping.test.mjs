import { normalizeTimeline, hashTimeline } from '../../domain/timeline/TimelineContract.js';
import { evaluateTimeline } from '../../engine/timeline/evaluateTimeline.js';
import { createTimelineController, dispatchTrack } from '../../engine/timeline/timelineController.js';
import { TrackActions } from '../../engine/timeline/trackDispatcher.js';

let threw = false;
try {
    normalizeTimeline({
        duration: 100,
        tracks: [
            { id: 't1', type: 'standard', order: 0, channelIds: [] },
        ],
        groups: [
            { id: 'g1', order: 0, trackIds: ['t1'] },
            { id: 'g2', order: 1, trackIds: ['t1'] },
        ],
    });
} catch (error) {
    threw = true;
}

console.log('NO DUP TRACKS IN GROUPS:', threw);

const lockedGroupTimeline = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: [] },
    ],
    groups: [
        { id: 'g1', order: 0, trackIds: ['t1'], meta: { locked: true } },
    ],
};

let controller = createTimelineController(lockedGroupTimeline);
controller = dispatchTrack(controller, {
    type: TrackActions.ASSIGN_CHANNEL,
    payload: { trackId: 't1', channelId: 'a' },
});

console.log('GROUP LOCK BLOCKS TRACK MUTATION:', controller.history.past.length === 0);

controller = dispatchTrack(controller, {
    type: TrackActions.TOGGLE_GROUP_LOCK,
    payload: { id: 'g1' },
});

controller = dispatchTrack(controller, {
    type: TrackActions.REMOVE_GROUP,
    payload: { id: 'g1' },
});

console.log(
    'REMOVE GROUP PRESERVES TRACKS:',
    controller.history.present.tracks.length === 1 &&
        controller.history.present.groups.length === 0
);

const evalBase = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x'] },
    ],
    groups: [
        { id: 'g1', order: 0, trackIds: ['t1'] },
        { id: 'g2', order: 1, trackIds: [] },
    ],
};

const evalReorderedGroups = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x'] },
    ],
    groups: [
        { id: 'g2', order: 0, trackIds: [] },
        { id: 'g1', order: 1, trackIds: ['t1'] },
    ],
};

const evalA = evaluateTimeline(evalBase, 0, () => 2, (a, b) => a + b);
const evalB = evaluateTimeline(evalReorderedGroups, 0, () => 2, (a, b) => a + b);

console.log('GROUP ORDER DOES NOT AFFECT EVAL:', JSON.stringify(evalA) === JSON.stringify(evalB));

const hashA = hashTimeline(evalBase);
const hashB = hashTimeline(evalReorderedGroups);

console.log('GROUP CHANGE CHANGES TIMELINE HASH:', hashA !== hashB);
console.log('GROUP CHANGE DOES NOT CHANGE EVAL:', JSON.stringify(evalA) === JSON.stringify(evalB));
