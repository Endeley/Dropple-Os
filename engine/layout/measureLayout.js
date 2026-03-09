function getPadding(container) {
    return {
        top: container?.padding?.top ?? 0,
        right: container?.padding?.right ?? 0,
        bottom: container?.padding?.bottom ?? 0,
        left: container?.padding?.left ?? 0,
    };
}

function getGap(container) {
    return {
        main: container?.gap?.main ?? 0,
        cross: container?.gap?.cross ?? 0,
    };
}

function getIntrinsicGeometry(nodeGeometry, nodeId) {
    const geometry = nodeGeometry?.[nodeId] ?? {};
    return {
        width: geometry.width ?? 0,
        height: geometry.height ?? 0,
    };
}

function resolveMeasuredAxis(sizing, intrinsicSize) {
    const mode = sizing?.mode ?? 'fixed';

    switch (mode) {
        case 'fixed':
            return sizing?.value ?? intrinsicSize ?? 0;
        case 'hug':
            return intrinsicSize ?? 0;
        case 'fill':
            return intrinsicSize ?? 0;
        case 'percent':
            return intrinsicSize ?? 0;
        default:
            return intrinsicSize ?? 0;
    }
}

function isFlowParticipant(layoutNode) {
    if (!layoutNode || layoutNode.mode !== 'flow') return false;
    if (layoutNode.participation?.excluded) return false;
    if (layoutNode.participation?.absoluteInContainer) return false;
    return true;
}

function isGridParticipant(layoutNode) {
    if (!layoutNode || layoutNode.mode !== 'grid') return false;
    if (layoutNode.participation?.excluded) return false;
    if (layoutNode.participation?.absoluteInContainer) return false;
    return true;
}

function getGridConfig(container) {
    return {
        columns: Math.max(1, Math.floor(container?.columns ?? 1)),
        rows: container?.rows ?? 'auto',
        columnGap: container?.columnGap ?? container?.gap?.main ?? 0,
        rowGap: container?.rowGap ?? container?.gap?.cross ?? 0,
    };
}

export function measureLayout({
    sceneGraph,
    layoutNodes = {},
    nodeGeometry = {},
} = {}) {
    const measured = {};
    const diagnostics = [];

    function measureNode(nodeId) {
        if (!nodeId) {
            return { width: 0, height: 0 };
        }

        if (measured[nodeId]) {
            return measured[nodeId];
        }

        const node = sceneGraph?.nodes?.[nodeId];
        const layoutNode = layoutNodes?.[nodeId];
        const intrinsic = getIntrinsicGeometry(nodeGeometry, nodeId);

        let width = resolveMeasuredAxis(layoutNode?.sizing?.width, intrinsic.width);
        let height = resolveMeasuredAxis(layoutNode?.sizing?.height, intrinsic.height);

        if (layoutNode?.mode === 'flow' && layoutNode.container && node) {
            const direction = layoutNode.container.type === 'column' ? 'column' : 'row';
            const padding = getPadding(layoutNode.container);
            const gap = getGap(layoutNode.container);
            const children = Array.isArray(node.children) ? node.children : [];
            const participants = children
                .map((childId) => ({
                    childId,
                    layoutNode: layoutNodes?.[childId],
                    measured: measureNode(childId),
                }))
                .filter((item) => isFlowParticipant(item.layoutNode));

            const gapTotal = gap.main * Math.max(0, participants.length - 1);
            const sumMain = participants.reduce(
                (total, item) =>
                    total + (direction === 'row' ? item.measured.width : item.measured.height),
                0,
            );
            const maxCross = participants.reduce((max, item) => {
                const next = direction === 'row' ? item.measured.height : item.measured.width;
                return Math.max(max, next);
            }, 0);

            const hugWidth =
                direction === 'row'
                    ? padding.left + sumMain + gapTotal + padding.right
                    : padding.left + maxCross + padding.right;
            const hugHeight =
                direction === 'row'
                    ? padding.top + maxCross + padding.bottom
                    : padding.top + sumMain + gapTotal + padding.bottom;

            if (layoutNode.sizing?.width?.mode === 'hug') {
                width = hugWidth;
            }

            if (layoutNode.sizing?.height?.mode === 'hug') {
                height = hugHeight;
            }
        } else if (layoutNode?.mode === 'grid' && layoutNode.container && node) {
            const padding = getPadding(layoutNode.container);
            const { columns, columnGap, rowGap } = getGridConfig(layoutNode.container);
            const children = Array.isArray(node.children) ? node.children : [];
            const participants = children
                .map((childId) => ({
                    childId,
                    layoutNode: layoutNodes?.[childId],
                    measured: measureNode(childId),
                }))
                .filter((item) => isGridParticipant(item.layoutNode));

            const rows = Math.max(1, Math.ceil(participants.length / columns));
            const columnWidths = Array.from({ length: columns }, () => 0);
            const rowHeights = Array.from({ length: rows }, () => 0);

            participants.forEach((item, index) => {
                const row = Math.floor(index / columns);
                const column = index % columns;
                columnWidths[column] = Math.max(columnWidths[column], item.measured.width);
                rowHeights[row] = Math.max(rowHeights[row], item.measured.height);
            });

            const hugWidth =
                padding.left +
                columnWidths.reduce((sum, value) => sum + value, 0) +
                Math.max(0, columns - 1) * columnGap +
                padding.right;
            const hugHeight =
                padding.top +
                rowHeights.reduce((sum, value) => sum + value, 0) +
                Math.max(0, rows - 1) * rowGap +
                padding.bottom;

            if (layoutNode.sizing?.width?.mode === 'hug') {
                width = hugWidth;
            }

            if (layoutNode.sizing?.height?.mode === 'hug') {
                height = hugHeight;
            }
        }

        measured[nodeId] = {
            width,
            height,
        };

        return measured[nodeId];
    }

    Object.keys(sceneGraph?.nodes ?? {}).forEach((nodeId) => {
        measureNode(nodeId);
    });

    return {
        measured,
        diagnostics,
    };
}
