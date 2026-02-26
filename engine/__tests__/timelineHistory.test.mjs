import {
    createTimelineHistory,
    applyTimelineMutation,
    undo,
    redo,
} from '../../engine/timeline/timelineHistory.js';
import { hashTimeline } from '../../domain/timeline/TimelineContract.js';

const base = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, channelIds: ['a'], type: 'standard' },
    ],
    channels: [],
};

let history = createTimelineHistory(base);

history = applyTimelineMutation(history, base);

console.log('NO OP SKIPPED:', Object.keys(history.nodes).length === 1);

const changed = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, channelIds: ['a', 'b'], type: 'standard' },
    ],
    channels: [],
};

history = applyTimelineMutation(history, changed);

console.log('CHANGE PUSHED:', Object.keys(history.nodes).length === 2);

const hashAfterChange = history.headId;

history = undo(history);

console.log('UNDO RESTORES:', history.headId !== hashAfterChange);

history = redo(history);

console.log('REDO RESTORES:', history.headId === hashAfterChange);

const node = history.nodes[history.headId];
console.log('SNAPSHOT ID INTEGRITY:', node.id === hashTimeline(node.timeline));
