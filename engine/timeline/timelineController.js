import { createTimelineHistory, applyTimelineMutation, undo, redo } from './timelineHistory.js';
import { dispatchTrackAction } from './trackDispatcher.js';
import { diffTimeline } from './diffTimeline.js';
import { hashTimeline } from '../../domain/timeline/TimelineContract.js';

export function createTimelineController(initialTimeline) {
    return {
        history: createTimelineHistory(initialTimeline),
    };
}

export function dispatchTrack(controller, action) {
    const current = controller.history.present;
    try {
        const nextTimeline = dispatchTrackAction(current, action);
        const diff = diffTimeline(current, nextTimeline);
        const nextHistory = applyTimelineMutation(controller.history, nextTimeline);

        return {
            ...controller,
            history: attachDiff(nextHistory, controller.history, diff),
        };
    } catch (error) {
        return controller;
    }
}

export function undoTimeline(controller) {
    return {
        ...controller,
        history: undo(controller.history),
    };
}

export function redoTimeline(controller) {
    return {
        ...controller,
        history: redo(controller.history),
    };
}

function attachDiff(nextHistory, prevHistory, diff) {
    if (nextHistory === prevHistory) return nextHistory;
    const lastIndex = nextHistory.past.length - 1;
    if (lastIndex < 0) return nextHistory;

    const pastEntry = nextHistory.past[lastIndex];
    const timeline = pastEntry?.timeline ?? pastEntry;
    const hash = hashTimeline(timeline);

    const nextPast = [...nextHistory.past];
    nextPast[lastIndex] = { timeline, hash, diff };

    return {
        ...nextHistory,
        past: nextPast,
    };
}
