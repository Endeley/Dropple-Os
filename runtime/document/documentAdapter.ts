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

export function getDocument(runtimeState: any) {
    return runtimeState?.document ?? null;
}

function overlayDocumentLayout(
    node: any,
    layoutNode: any,
    computedLayout: any,
    computedSceneNode: any,
) {
    if (!node || (!layoutNode && !computedLayout && !computedSceneNode)) return node;

    const nextLayout = {
        ...(node?.layout ?? {}),
        ...(layoutNode ?? {}),
    };

    if (layoutNode) {
        if (layoutNode.x != null) nextLayout.x = layoutNode.x;
        if (layoutNode.y != null) nextLayout.y = layoutNode.y;
        if (layoutNode.width != null) nextLayout.width = layoutNode.width;
        if (layoutNode.height != null) nextLayout.height = layoutNode.height;
    }

    if (computedLayout) {
        nextLayout.x = computedLayout.x;
        nextLayout.y = computedLayout.y;
        nextLayout.width = computedLayout.width;
        nextLayout.height = computedLayout.height;
    }

    if (computedSceneNode) {
        nextLayout.x = nextLayout.x ?? computedSceneNode.x;
        nextLayout.y = nextLayout.y ?? computedSceneNode.y;
        nextLayout.width = nextLayout.width ?? computedSceneNode.width;
        nextLayout.height = nextLayout.height ?? computedSceneNode.height;
    }

    return {
        ...node,
        x: computedLayout?.x ?? layoutNode?.x ?? computedSceneNode?.x ?? node?.x,
        y: computedLayout?.y ?? layoutNode?.y ?? computedSceneNode?.y ?? node?.y,
        width:
            computedLayout?.width ??
            layoutNode?.width ??
            computedSceneNode?.width ??
            node?.width,
        height:
            computedLayout?.height ??
            layoutNode?.height ??
            computedSceneNode?.height ??
            node?.height,
        layout: nextLayout,
    };
}

export function getSceneGraph(runtimeState: any) {
    const documentSceneGraph = runtimeState?.document?.sceneGraph ?? null;
    if (!documentSceneGraph) {
        return null;
    }

    const layoutNodes = runtimeState?.document?.layout?.nodes ?? {};
    const computedNodes = runtimeState?.document?.layout?.computed ?? {};
    const computedSceneNodes = runtimeState?.scene?.computed ?? {};
    const nextNodes = Object.fromEntries(
        Object.entries(documentSceneGraph.nodes ?? {}).map(([nodeId, node]) => [
            nodeId,
            overlayDocumentLayout(
                node,
                layoutNodes[nodeId],
                computedNodes[nodeId],
                computedSceneNodes[nodeId],
            ),
        ]),
    );

    return {
        ...documentSceneGraph,
        nodes: nextNodes,
    };
}

export function getNodes(runtimeState: any) {
    return getSceneGraph(runtimeState)?.nodes ?? {};
}

export function getRootIds(runtimeState: any) {
    return getSceneGraph(runtimeState)?.rootIds ?? [];
}

export function getNode(runtimeState: any, nodeId: string) {
    return getNodes(runtimeState)?.[nodeId] ?? null;
}

export function getLayout(runtimeState: any) {
    return runtimeState?.document?.layout ?? null;
}

export function getLayoutNode(runtimeState: any, nodeId: string) {
    const layout = getLayout(runtimeState);
    return layout?.nodes?.[nodeId] ?? null;
}

export function resolveLayoutNode(runtimeState: any, nodeId: string) {
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

export function isContainer(runtimeState: any, nodeId: string) {
    return resolveLayoutNode(runtimeState, nodeId).container != null;
}
