export function createInitialGraphInteractionState() {
    return {
        activeGraphId: null,
        selection: {
            ids: [],
            primary: null,
        },
        drag: {
            active: false,
            nodeId: null,
            origin: null,
            startPointer: null,
            currentPointer: null,
        },
        pan: {
            active: false,
            anchor: null,
        },
        viewport: {
            x: 0,
            y: 0,
            zoom: 1,
        },
        connection: {
            active: false,
            fromNodeId: null,
            pointerX: 0,
            pointerY: 0,
        },
    };
}
