function getPadding(container) {
    return {
        top: container?.padding?.top ?? 0,
        right: container?.padding?.right ?? 0,
        bottom: container?.padding?.bottom ?? 0,
        left: container?.padding?.left ?? 0,
    };
}

function getGridConfig(container) {
    return {
        columns: Math.max(1, Math.floor(container?.columns ?? 1)),
        rows: container?.rows ?? 'auto',
        columnGap: container?.columnGap ?? container?.gap?.main ?? 0,
        rowGap: container?.rowGap ?? container?.gap?.cross ?? 0,
    };
}

function buildBox(x, y, width, height) {
    return { x, y, width, height };
}

export function resolveGridContainer({
    containerId,
    sceneGraph,
    layoutNodes,
    computed,
    measured = {},
} = {}) {
    const containerNode = sceneGraph?.nodes?.[containerId];
    const containerLayout = layoutNodes?.[containerId];
    const containerConfig = containerLayout?.container;
    const baseContainer = computed?.[containerId];

    if (!containerNode || !containerConfig || !baseContainer) {
        return { computed, affectedNodes: [], diagnostics: [] };
    }

    const padding = getPadding(containerConfig);
    const { columns, columnGap, rowGap } = getGridConfig(containerConfig);
    const childIds = Array.isArray(containerNode.children) ? containerNode.children : [];
    const participants = childIds.filter((childId) => {
        const childLayout = layoutNodes?.[childId];
        if (!childLayout || childLayout.mode !== 'grid') return false;
        if (childLayout.participation?.excluded) return false;
        if (childLayout.participation?.absoluteInContainer) return false;
        return true;
    });

    if (!participants.length) {
        return {
            computed: {
                ...computed,
                [containerId]: {
                    ...baseContainer,
                    revision: (computed?.[containerId]?.revision ?? 0) + 1,
                },
            },
            affectedNodes: [],
            diagnostics: [],
        };
    }

    const contentWidth = Math.max(0, baseContainer.width - padding.left - padding.right);
    const cellWidth =
        columns > 0
            ? Math.max(0, (contentWidth - Math.max(0, columns - 1) * columnGap) / columns)
            : 0;

    const rowHeights = [];
    participants.forEach((childId, index) => {
        const row = Math.floor(index / columns);
        const measuredChild = measured?.[childId];
        const baseChild = computed?.[childId];
        const childHeight =
            measuredChild?.height ??
            baseChild?.height ??
            0;
        rowHeights[row] = Math.max(rowHeights[row] ?? 0, childHeight);
    });

    const rowOffsets = [];
    let rowCursor = 0;
    rowHeights.forEach((height, rowIndex) => {
        rowOffsets[rowIndex] = rowCursor;
        rowCursor += height + (rowIndex < rowHeights.length - 1 ? rowGap : 0);
    });

    const nextComputed = { ...computed };
    const affectedNodes = [];

    participants.forEach((childId, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const childLayout = layoutNodes?.[childId];
        const measuredChild = measured?.[childId];
        const baseChild = computed?.[childId];
        const intrinsicWidth =
            measuredChild?.width ??
            baseChild?.width ??
            0;
        const intrinsicHeight =
            measuredChild?.height ??
            baseChild?.height ??
            0;
        const rowHeight = rowHeights[row] ?? intrinsicHeight;

        const width =
            childLayout?.sizing?.width?.mode === 'fill'
                ? cellWidth
                : Math.min(intrinsicWidth, cellWidth || intrinsicWidth);
        const height =
            childLayout?.sizing?.height?.mode === 'fill'
                ? rowHeight
                : intrinsicHeight;

        const x = baseContainer.x + padding.left + column * (cellWidth + columnGap);
        const y = baseContainer.y + padding.top + (rowOffsets[row] ?? 0);

        nextComputed[childId] = {
            x,
            y,
            width,
            height,
            contentBox: buildBox(x, y, width, height),
            paddingBox: buildBox(x, y, width, height),
            revision: (computed?.[childId]?.revision ?? 0) + 1,
        };
        affectedNodes.push(childId);
    });

    nextComputed[containerId] = {
        ...baseContainer,
        revision: (computed?.[containerId]?.revision ?? 0) + 1,
    };

    return {
        computed: nextComputed,
        affectedNodes,
        diagnostics: [],
    };
}
