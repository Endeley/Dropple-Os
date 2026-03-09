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

function getAlignment(container) {
    return {
        main: container?.align?.main ?? 'start',
        cross: container?.align?.cross ?? 'start',
    };
}

function getChildAlignment(layoutNode, fallback) {
    return layoutNode?.alignSelf?.cross ?? fallback;
}

function applyCrossAlignment({ align, availableCross, childCrossSize }) {
    const freeSpace = Math.max(0, availableCross - childCrossSize);

    switch (align) {
        case 'center':
            return freeSpace / 2;
        case 'end':
            return freeSpace;
        case 'stretch':
        case 'start':
        default:
            return 0;
    }
}

function buildBox(x, y, width, height) {
    return { x, y, width, height };
}

export function resolveFlowContainer({
    containerId,
    sceneGraph,
    layoutNodes,
    computed,
    measured = {},
} = {}) {
    const containerNode = sceneGraph?.nodes?.[containerId];
    const containerLayout = layoutNodes?.[containerId];
    const containerConfig = containerLayout?.container;
    if (!containerNode || !containerConfig) {
        return { computed, affectedNodes: [], diagnostics: [] };
    }

    const direction = containerConfig.type === 'column' ? 'column' : 'row';
    const padding = getPadding(containerConfig);
    const gap = getGap(containerConfig);
    const align = getAlignment(containerConfig);

    const baseContainer = computed?.[containerId];
    if (!baseContainer) {
        return { computed, affectedNodes: [], diagnostics: [] };
    }
    const contentWidth = Math.max(0, baseContainer.width - padding.left - padding.right);
    const contentHeight = Math.max(0, baseContainer.height - padding.top - padding.bottom);
    const availableMain = direction === 'row' ? contentWidth : contentHeight;
    const availableCross = direction === 'row' ? contentHeight : contentWidth;

    const childIds = Array.isArray(containerNode.children) ? containerNode.children : [];
    const participating = childIds.filter((childId) => {
        const childLayout = layoutNodes?.[childId];
        if (!childLayout || childLayout.mode !== 'flow') return false;
        if (childLayout.participation?.excluded) return false;
        if (childLayout.participation?.absoluteInContainer) return false;
        return true;
    });

    if (!participating.length) {
        return { computed, affectedNodes: [], diagnostics: [] };
    }

    const nextComputed = { ...computed };
    const affectedNodes = [];
    const measurements = [];

    let occupiedMain = 0;
    let fillCount = 0;

    participating.forEach((childId) => {
        const childLayout = layoutNodes?.[childId] ?? {};
        const mainSizing = direction === 'row' ? childLayout.sizing?.width : childLayout.sizing?.height;
        const measuredChild = measured?.[childId] ?? {};
        const isFillMain = mainSizing?.mode === 'fill';
        if (isFillMain) {
            fillCount += 1;
        }

        const measuredMain = isFillMain
            ? 0
            : direction === 'row'
              ? measuredChild.width ?? 0
              : measuredChild.height ?? 0;

        const measuredCross =
            direction === 'row'
                ? measuredChild.height ?? 0
                : measuredChild.width ?? 0;

        occupiedMain += measuredMain;
        measurements.push({
            childId,
            childLayout,
            main: measuredMain,
            cross: measuredCross,
            fillMain: isFillMain,
        });
    });

    const totalBaseGap = gap.main * Math.max(0, participating.length - 1);
    const remainingMain = Math.max(0, availableMain - occupiedMain - totalBaseGap);
    const fillMainSize = fillCount > 0 ? remainingMain / fillCount : 0;

    const finalized = measurements.map((item) => {
        const main = item.fillMain ? fillMainSize : item.main;
        let cross = item.cross;
        const crossAlign = getChildAlignment(item.childLayout, align.cross);
        const crossSizing =
            direction === 'row'
                ? item.childLayout.sizing?.height
                : item.childLayout.sizing?.width;
        if (
            (crossAlign === 'stretch' && item.childLayout.sizing) ||
            crossSizing?.mode === 'fill'
        ) {
            cross = availableCross;
        }

        return {
            ...item,
            main,
            cross,
            crossAlign,
        };
    });

    const occupiedWithGap =
        finalized.reduce((sum, item) => sum + item.main, 0) +
        gap.main * Math.max(0, finalized.length - 1);
    const extraMain = Math.max(0, availableMain - occupiedWithGap);

    let mainOffset = 0;
    let effectiveGap = gap.main;

    switch (align.main) {
        case 'center':
            mainOffset = extraMain / 2;
            break;
        case 'end':
            mainOffset = extraMain;
            break;
        case 'space-between':
            if (finalized.length > 1) {
                effectiveGap = gap.main + extraMain / (finalized.length - 1);
            }
            break;
        case 'start':
        default:
            break;
    }

    let cursor = mainOffset;
    finalized.forEach((item) => {
        const crossOffset = applyCrossAlignment({
            align: item.crossAlign,
            availableCross,
            childCrossSize: item.cross,
        });

        const x =
            direction === 'row'
                ? baseContainer.x + padding.left + cursor
                : baseContainer.x + padding.left + crossOffset;
        const y =
            direction === 'row'
                ? baseContainer.y + padding.top + crossOffset
                : baseContainer.y + padding.top + cursor;
        const width = direction === 'row' ? item.main : item.cross;
        const height = direction === 'row' ? item.cross : item.main;

        nextComputed[item.childId] = {
            x,
            y,
            width,
            height,
            contentBox: buildBox(x, y, width, height),
            paddingBox: buildBox(x, y, width, height),
            revision: (computed?.[item.childId]?.revision ?? 0) + 1,
        };
        affectedNodes.push(item.childId);
        cursor += item.main + effectiveGap;
    });

    return {
        computed: {
            ...nextComputed,
            [containerId]: {
                ...baseContainer,
                revision: (computed?.[containerId]?.revision ?? 0) + 1,
            },
        },
        affectedNodes,
        diagnostics: [],
    };
}
