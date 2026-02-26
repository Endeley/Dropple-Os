import {
    createTimelineHistory,
    applyTimelineMutation,
    undo,
    redo,
} from '../../engine/timeline/timelineHistory.js';

const base = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, channelIds: ['a'], type: 'standard' },
    ],
};

let history = createTimelineHistory(base);

history = applyTimelineMutation(history, base);

console.log('NO OP SKIPPED:', history.past.length === 0);

const changed = {
    duration: 100,
    tracks: [
        { id: 't1', order: 0, channelIds: ['a', 'b'], type: 'standard' },
    ],
};

history = applyTimelineMutation(history, changed);

console.log('CHANGE PUSHED:', history.past.length === 1);

const hashAfterChange = history.presentHash;

history = undo(history);

console.log('UNDO RESTORES:', history.presentHash !== hashAfterChange);

history = redo(history);

console.log('REDO RESTORES:', history.presentHash === hashAfterChange);
