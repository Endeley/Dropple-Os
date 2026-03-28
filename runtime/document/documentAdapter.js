// runtime/document/documentAdapter.js

const DEFAULT_LAYOUT_NODE = Object.freeze({
    mode: 'free',
    container: null,
    sizing: {
        width: {
            mode: 'fixed',
            value: null,
        },
        height: {
            mode: 'fixed',
            value: null,
        },
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
        aspectRatio: null,
    },
    alignSelf: {
        main: 'auto',
        cross: 'auto',
    },
    constraints: {
        left: false,
        right: false,
        top: false,
        bottom: false,
        centerX: false,
        centerY: false,
    },
    offsetLeft: 0,
    offsetRight: 0,
    offsetTop: 0,
    offsetBottom: 0,
    participation: {
        absoluteInContainer: false,
        excluded: false,
    },
});

export function getDocument(runtimeState) {
    return runtimeState?.document ?? null;
}

function overlayRuntimeGeometry(node, runtimeNode) {
    if (!node || !runtimeNode) return node;

    const runtimeLayout = runtimeNode?.layout ?? {};
    const runtimeX = runtimeLayout.x ?? runtimeNode?.x;
    const runtimeY = runtimeLayout.y ?? runtimeNode?.y;
    const runtimeWidth = runtimeLayout.width ?? runtimeNode?.width;
    const runtimeHeight = runtimeLayout.height ?? runtimeNode?.height;

    if (
        runtimeX == null &&
        runtimeY == null &&
        runtimeWidth == null &&
        runtimeHeight == null
    ) {
        return node;
    }

    return {
        ...node,
        x: runtimeX ?? node?.x,
        y: runtimeY ?? node?.y,
        width: runtimeWidth ?? node?.width,
        height: runtimeHeight ?? node?.height,
        layout: {
            ...(node?.layout ?? {}),
            x: runtimeX ?? node?.layout?.x ?? node?.x,
            y: runtimeY ?? node?.layout?.y ?? node?.y,
            width: runtimeWidth ?? node?.layout?.width ?? node?.width,
            height: runtimeHeight ?? node?.layout?.height ?? node?.height,
        },
    };
}

export function getSceneGraph(runtimeState) {
    const documentSceneGraph = runtimeState?.document?.sceneGraph ?? null;
    if (!documentSceneGraph) {
        return runtimeState?.sceneGraph ?? null;
    }

    const runtimeNodes = runtimeState?.nodes ?? {};
    const nextNodes = Object.fromEntries(
        Object.entries(documentSceneGraph.nodes ?? {}).map(([nodeId, node]) => [
            nodeId,
            overlayRuntimeGeometry(node, runtimeNodes[nodeId]),
        ]),
    );

    return {
        ...documentSceneGraph,
        nodes: nextNodes,
    };
}

export function getNode(runtimeState, nodeId) {
    const graph = getSceneGraph(runtimeState);
    return graph?.nodes?.[nodeId] ?? null;
}

export function getLayout(runtimeState) {
    return runtimeState?.document?.layout ?? null;
}

export function getMotionDocument(runtimeState) {
    return runtimeState?.document?.motion ?? null;
}

export function getMotionClip(runtimeState, clipId) {
    return getMotionDocument(runtimeState)?.clips?.[clipId] ?? null;
}

export function getMotionClips(runtimeState) {
    return Object.values(getMotionDocument(runtimeState)?.clips ?? {});
}

export function getLayoutNode(runtimeState, nodeId) {
    const layout = getLayout(runtimeState);
    return layout?.nodes?.[nodeId] ?? null;
}

export function resolveLayoutNode(runtimeState, nodeId) {
    const layoutNode = getLayoutNode(runtimeState, nodeId);
    if (!layoutNode) {
        return {
            ...DEFAULT_LAYOUT_NODE,
            sizing: {
                ...DEFAULT_LAYOUT_NODE.sizing,
                width: { ...DEFAULT_LAYOUT_NODE.sizing.width },
                height: { ...DEFAULT_LAYOUT_NODE.sizing.height },
            },
            alignSelf: { ...DEFAULT_LAYOUT_NODE.alignSelf },
            constraints: { ...DEFAULT_LAYOUT_NODE.constraints },
            offsetLeft: DEFAULT_LAYOUT_NODE.offsetLeft,
            offsetRight: DEFAULT_LAYOUT_NODE.offsetRight,
            offsetTop: DEFAULT_LAYOUT_NODE.offsetTop,
            offsetBottom: DEFAULT_LAYOUT_NODE.offsetBottom,
            participation: { ...DEFAULT_LAYOUT_NODE.participation },
        };
    }

    return {
        ...DEFAULT_LAYOUT_NODE,
        ...layoutNode,
        sizing: {
            ...DEFAULT_LAYOUT_NODE.sizing,
            ...(layoutNode.sizing || {}),
            width: {
                ...DEFAULT_LAYOUT_NODE.sizing.width,
                ...(layoutNode.sizing?.width || {}),
            },
            height: {
                ...DEFAULT_LAYOUT_NODE.sizing.height,
                ...(layoutNode.sizing?.height || {}),
            },
        },
        alignSelf: {
            ...DEFAULT_LAYOUT_NODE.alignSelf,
            ...(layoutNode.alignSelf || {}),
        },
        constraints: {
            ...DEFAULT_LAYOUT_NODE.constraints,
            ...(layoutNode.constraints || {}),
        },
        offsetLeft: layoutNode.offsetLeft ?? DEFAULT_LAYOUT_NODE.offsetLeft,
        offsetRight: layoutNode.offsetRight ?? DEFAULT_LAYOUT_NODE.offsetRight,
        offsetTop: layoutNode.offsetTop ?? DEFAULT_LAYOUT_NODE.offsetTop,
        offsetBottom: layoutNode.offsetBottom ?? DEFAULT_LAYOUT_NODE.offsetBottom,
        participation: {
            ...DEFAULT_LAYOUT_NODE.participation,
            ...(layoutNode.participation || {}),
        },
    };
}

export function isContainer(runtimeState, nodeId) {
    return resolveLayoutNode(runtimeState, nodeId).container != null;
}
