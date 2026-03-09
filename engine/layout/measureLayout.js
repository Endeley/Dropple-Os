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
        } else if (layoutNode?.mode === 'grid') {
            diagnostics.push({
                nodeId,
                level: 'info',
                message: 'Grid measurement not implemented in v1 layout engine.',
            });
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
