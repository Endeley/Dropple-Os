import {
    selectActiveGraph,
    selectActiveGraphId,
    selectGraphEdges,
    selectGraphErrors,
    selectGraphNodes,
} from '@/runtime/projection/selectors/graphSelectors.js';
import { createInitialGraphInteractionState } from '@/core/events/graphInteractionState.js';

export function selectGraphInteractionState(state) {
    return state?.graph ?? createInitialGraphInteractionState();
}

export function selectGraphSelection(state) {
    return selectGraphInteractionState(state).selection ?? { ids: [], primary: null };
}

export function selectGraphViewport(state) {
    return selectGraphInteractionState(state).viewport ?? { x: 0, y: 0, zoom: 1 };
}

export function selectGraphDrag(state) {
    return selectGraphInteractionState(state).drag ?? {
        active: false,
        nodeId: null,
        origin: null,
        startPointer: null,
        currentPointer: null,
    };
}

export function selectGraphConnection(state) {
    return selectGraphInteractionState(state).connection ?? {
        active: false,
        fromNodeId: null,
        pointerX: 0,
        pointerY: 0,
    };
}

export function selectGraphDragPreviewPositions(state) {
    const drag = selectGraphDrag(state);
    if (!drag?.active || !drag.nodeId || !drag.origin || !drag.startPointer || !drag.currentPointer) {
        return {};
    }

    const dx = Number(drag.currentPointer.x ?? 0) - Number(drag.startPointer.x ?? 0);
    const dy = Number(drag.currentPointer.y ?? 0) - Number(drag.startPointer.y ?? 0);

    return {
        [drag.nodeId]: {
            x: Number(drag.origin.x ?? 0) + dx,
            y: Number(drag.origin.y ?? 0) + dy,
        },
    };
}

export function projectGraphInteraction(state) {
    return {
        activeGraphId: selectActiveGraphId(state),
        activeGraph: selectActiveGraph(state),
        nodes: selectGraphNodes(state),
        edges: selectGraphEdges(state),
        errors: selectGraphErrors(state),
        selection: selectGraphSelection(state),
        viewport: selectGraphViewport(state),
        drag: selectGraphDrag(state),
        connection: selectGraphConnection(state),
        dragPreviewPositions: selectGraphDragPreviewPositions(state),
    };
}
