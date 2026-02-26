import {
    createTimelineHistory,
    applyTimelineMutation,
    undo,
    redo,
    checkoutSnapshot as checkoutSnapshotInternal,
    setSnapshotLabel as setSnapshotLabelInternal,
} from './timelineHistory.js';
import { dispatchTrackAction } from './trackDispatcher.js';

export function createTimelineController(initialTimeline) {
    const graph = createTimelineHistory(initialTimeline);
    return {
        snapshotGraph: graph,
        headId: graph.headId,
    };
}

export function dispatchTrack(controller, action) {
    const graph = controller.snapshotGraph;
    const currentNode = graph.nodes[graph.headId];
    const current = currentNode.timeline;
    try {
        const nextTimeline = dispatchTrackAction(current, action);
        const nextGraph = applyTimelineMutation(graph, nextTimeline);
        if (nextGraph === graph) return controller;
        return {
            ...controller,
            snapshotGraph: nextGraph,
            headId: nextGraph.headId,
        };
    } catch (error) {
        return controller;
    }
}

export function undoTimeline(controller) {
    const nextGraph = undo(controller.snapshotGraph);
    if (nextGraph === controller.snapshotGraph) return controller;
    return {
        ...controller,
        snapshotGraph: nextGraph,
        headId: nextGraph.headId,
    };
}

export function redoTimeline(controller) {
    const nextGraph = redo(controller.snapshotGraph);
    if (nextGraph === controller.snapshotGraph) return controller;
    return {
        ...controller,
        snapshotGraph: nextGraph,
        headId: nextGraph.headId,
    };
}

export function checkoutSnapshot(controller, snapshotId) {
    const nextGraph = checkoutSnapshotInternal(controller.snapshotGraph, snapshotId);
    if (nextGraph === controller.snapshotGraph) return controller;
    return {
        ...controller,
        snapshotGraph: nextGraph,
        headId: nextGraph.headId,
    };
}

export function setSnapshotLabel(controller, { snapshotId, label }) {
    const nextGraph = setSnapshotLabelInternal(controller.snapshotGraph, {
        snapshotId,
        label,
    });
    if (nextGraph === controller.snapshotGraph) return controller;
    return {
        ...controller,
        snapshotGraph: nextGraph,
        headId: nextGraph.headId,
    };
}
