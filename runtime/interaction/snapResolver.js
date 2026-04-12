import { snapDelta } from './snapEngine.js';
import { computeSnapTargets } from '@/runtime/snapping/computeSnapTargets.js';

const SNAP_PRIORITY = Object.freeze({
    spacing: 2.0,
    center: 1.5,
    edge: 1.0,
    grid: 0.6,
});

function computeIntentBias(delta, candidateDelta) {
    const direction = Math.sign(delta);
    const targetDirection = Math.sign(candidateDelta);

    if (direction !== 0 && direction === targetDirection) {
        return 0.85;
    }

    return 1.1;
}

function normalizeTarget(target) {
    if (target?.type === 'v' && Number.isFinite(target.x)) {
        return {
            axis: 'x',
            kind: 'edge',
            value: target.x,
            source: target.nodeId ?? null,
            weight: 1,
            priority: SNAP_PRIORITY.edge,
        };
    }

    if (target?.type === 'h' && Number.isFinite(target.y)) {
        return {
            axis: 'y',
            kind: 'edge',
            value: target.y,
            source: target.nodeId ?? null,
            weight: 1,
            priority: SNAP_PRIORITY.edge,
        };
    }

    if ((target?.axis === 'x' || target?.axis === 'y') && Number.isFinite(target.value)) {
        return {
            axis: target.axis,
            kind: target.kind ?? 'edge',
            value: target.value,
            source: target.source ?? null,
            weight: Number.isFinite(target.weight) ? target.weight : 1,
            priority: Number.isFinite(target.priority)
                ? target.priority
                : target.kind === 'center'
                    ? SNAP_PRIORITY.center
                    : SNAP_PRIORITY.edge,
        };
    }

    return null;
}

function normalizeLayoutNode(node, computedTransforms = {}) {
    const layout = node?.layout ?? {};
    const transform = computedTransforms[node?.id] ?? node?.transform ?? {};
    return {
        id: node?.id ?? null,
        x: transform.x ?? layout.x ?? node?.x ?? 0,
        y: transform.y ?? layout.y ?? node?.y ?? 0,
        width: transform.width ?? layout.width ?? node?.width ?? 0,
        height: transform.height ?? layout.height ?? node?.height ?? 0,
    };
}

function collectSpacingTargetsX(nodesById, excludedIds, computedTransforms) {
    const items = Object.values(nodesById ?? {})
        .map((node) => normalizeLayoutNode(node, computedTransforms))
        .filter((node) => node.id && !excludedIds.has(node.id))
        .sort((a, b) => a.x - b.x || a.y - b.y || a.id.localeCompare(b.id));
    const targets = [];

    for (let index = 0; index < items.length - 1; index += 1) {
        const left = items[index];
        const right = items[index + 1];
        const spacing = right.x - (left.x + left.width);
        if (spacing <= 0) continue;

        targets.push({
            axis: 'x',
            kind: 'spacing',
            left: left.x + left.width,
            right: right.x,
            spacing,
            source: `${left.id}:${right.id}`,
            weight: 1.15,
            priority: SNAP_PRIORITY.spacing,
        });
    }

    return targets;
}

function collectSpacingTargetsY(nodesById, excludedIds, computedTransforms) {
    const items = Object.values(nodesById ?? {})
        .map((node) => normalizeLayoutNode(node, computedTransforms))
        .filter((node) => node.id && !excludedIds.has(node.id))
        .sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id));
    const targets = [];

    for (let index = 0; index < items.length - 1; index += 1) {
        const top = items[index];
        const bottom = items[index + 1];
        const spacing = bottom.y - (top.y + top.height);
        if (spacing <= 0) continue;

        targets.push({
            axis: 'y',
            kind: 'spacing',
            top: top.y + top.height,
            bottom: bottom.y,
            spacing,
            source: `${top.id}:${bottom.id}`,
            weight: 1.15,
            priority: SNAP_PRIORITY.spacing,
        });
    }

    return targets;
}

export function collectSnapTargets(state, dragState) {
    const excludedIds = Array.isArray(dragState?.nodeIds) ? dragState.nodeIds : [];
    const excluded = new Set(excludedIds);
    const computedTransforms = state?.scene?.computed?.transforms ?? {};
    const axisTargets = computeSnapTargets(state?.scene?.computed ?? {}, excludedIds)
        .map(normalizeTarget)
        .filter(Boolean);
    const spacingTargets = [
        ...collectSpacingTargetsX(state?.nodes ?? {}, excluded, computedTransforms),
        ...collectSpacingTargetsY(state?.nodes ?? {}, excluded, computedTransforms),
    ];

    return [...axisTargets, ...spacingTargets];
}

function getAnchors(bounds, axis) {
    if (!bounds) return [];

    if (axis === 'x') {
        return [
            { kind: 'edge', value: bounds.x, priority: SNAP_PRIORITY.edge },
            { kind: 'center', value: bounds.x + bounds.width / 2, priority: SNAP_PRIORITY.center },
            { kind: 'edge', value: bounds.x + bounds.width, priority: SNAP_PRIORITY.edge },
        ];
    }

    return [
        { kind: 'edge', value: bounds.y, priority: SNAP_PRIORITY.edge },
        { kind: 'center', value: bounds.y + bounds.height / 2, priority: SNAP_PRIORITY.center },
        { kind: 'edge', value: bounds.y + bounds.height, priority: SNAP_PRIORITY.edge },
    ];
}

function getResizeAnchors(bounds, axis, handle) {
    if (!bounds) return [];

    if (axis === 'x') {
        const anchors = [];
        if (!handle || handle.includes('w')) {
            anchors.push({ kind: 'edge', value: bounds.x, priority: SNAP_PRIORITY.edge });
        }
        if (!handle || handle.includes('e')) {
            anchors.push({ kind: 'edge', value: bounds.x + bounds.width, priority: SNAP_PRIORITY.edge });
        }
        if (anchors.length === 0) {
            anchors.push(
                { kind: 'edge', value: bounds.x, priority: SNAP_PRIORITY.edge },
                { kind: 'edge', value: bounds.x + bounds.width, priority: SNAP_PRIORITY.edge },
            );
        }
        return anchors;
    }

    const anchors = [];
    if (!handle || handle.includes('n')) {
        anchors.push({ kind: 'edge', value: bounds.y, priority: SNAP_PRIORITY.edge });
    }
    if (!handle || handle.includes('s')) {
        anchors.push({ kind: 'edge', value: bounds.y + bounds.height, priority: SNAP_PRIORITY.edge });
    }
    if (anchors.length === 0) {
        anchors.push(
            { kind: 'edge', value: bounds.y, priority: SNAP_PRIORITY.edge },
            { kind: 'edge', value: bounds.y + bounds.height, priority: SNAP_PRIORITY.edge },
        );
    }
    return anchors;
}

function resolveAxisSnap(axis, delta, bounds, context) {
    const threshold = Number.isFinite(context?.threshold) ? context.threshold : 6;
    const grid = Number.isFinite(context?.grid) ? context.grid : 10;
    const gridWeight = Number.isFinite(context?.gridWeight) ? context.gridWeight : 0.7;
    const gridPriority = Number.isFinite(context?.gridPriority) ? context.gridPriority : SNAP_PRIORITY.grid;
    const targets = Array.isArray(context?.targets) ? context.targets : [];
    const isResize = context?.mode === 'resize';
    const anchors = isResize
        ? getResizeAnchors(bounds, axis, context?.handle ?? null)
        : getAnchors(bounds, axis);

    let best = {
        delta,
        score: Infinity,
        guide: null,
    };

    const snappedGrid = snapDelta(
        axis === 'x' ? { dx: delta, dy: 0 } : { dx: 0, dy: delta },
        { grid },
    );
    const gridDelta = axis === 'x' ? snappedGrid.dx : snappedGrid.dy;
    const gridDistance = Math.abs(gridDelta - delta);

    if (gridDistance <= threshold) {
        const intentBias = computeIntentBias(delta, gridDelta);
        best = {
            delta: gridDelta,
            score: ((gridDistance / gridWeight) / gridPriority) * intentBias,
            guide: null,
        };
    }

    for (const target of targets) {
        if (target.axis !== axis) continue;

        if (target.kind === 'spacing') {
            if (!bounds) continue;
            const weight = Number.isFinite(target.weight) && target.weight > 0 ? target.weight : 1;
            const priority = Number.isFinite(target.priority) && target.priority > 0 ? target.priority : 1;
            const centerY = bounds ? bounds.y + bounds.height / 2 : 0;
            const centerX = bounds ? bounds.x + bounds.width / 2 : 0;
            const spacingCandidates =
                axis === 'x'
                    ? [
                          {
                              delta: (target.left + target.spacing) - bounds.x,
                              guide: {
                                  type: 'spacing',
                                  axis: 'x',
                                  from: target.left,
                                  to: target.left + target.spacing,
                                  y: centerY,
                                  spacing: target.spacing,
                                  source: target.source ?? null,
                              },
                          },
                          {
                              delta: (target.right - target.spacing) - (bounds.x + bounds.width),
                              guide: {
                                  type: 'spacing',
                                  axis: 'x',
                                  from: target.right - target.spacing,
                                  to: target.right,
                                  y: centerY,
                                  spacing: target.spacing,
                                  source: target.source ?? null,
                              },
                          },
                      ]
                    : [
                          {
                              delta: (target.top + target.spacing) - bounds.y,
                              guide: {
                                  type: 'spacing',
                                  axis: 'y',
                                  from: target.top,
                                  to: target.top + target.spacing,
                                  x: centerX,
                                  spacing: target.spacing,
                                  source: target.source ?? null,
                              },
                          },
                          {
                              delta: (target.bottom - target.spacing) - (bounds.y + bounds.height),
                              guide: {
                                  type: 'spacing',
                                  axis: 'y',
                                  from: target.bottom - target.spacing,
                                  to: target.bottom,
                                  x: centerX,
                                  spacing: target.spacing,
                                  source: target.source ?? null,
                              },
                          },
                      ];

            for (const candidate of spacingCandidates) {
                const distance = Math.abs(candidate.delta - delta);
                if (distance > threshold) continue;
                const intentBias = computeIntentBias(delta, candidate.delta);
                const score = ((distance / weight) / priority) * intentBias;
                if (score < best.score) {
                    best = {
                        delta: candidate.delta,
                        score,
                        guide: candidate.guide,
                    };
                }
            }
            continue;
        }

        for (const anchor of anchors) {
            const offset = target.value - anchor.value;
            const candidateDelta = delta + offset;
            const distance = Math.abs(offset);
            if (distance > threshold) continue;

            const weight = Number.isFinite(target.weight) && target.weight > 0 ? target.weight : 1;
            const priority =
                (Number.isFinite(target.priority) && target.priority > 0 ? target.priority : 1) *
                (Number.isFinite(anchor.priority) && anchor.priority > 0 ? anchor.priority : 1);
            const intentBias = computeIntentBias(delta, candidateDelta);
            const score = ((distance / weight) / priority) * intentBias;

            if (score < best.score) {
                best = {
                    delta: candidateDelta,
                    score,
                    guide:
                        axis === 'x'
                            ? { type: 'vertical', x: target.value, source: target.source ?? null }
                            : { type: 'horizontal', y: target.value, source: target.source ?? null },
                };
            }
        }
    }

    return best;
}

export function resolveSnap(delta, context = {}) {
    const bounds = context?.bounds ?? null;
    const xResult = resolveAxisSnap('x', delta?.dx ?? 0, bounds, context);
    const yResult = resolveAxisSnap('y', delta?.dy ?? 0, bounds, context);

    return {
        dx: xResult.delta,
        dy: yResult.delta,
        guides: [xResult.guide, yResult.guide].filter(Boolean),
    };
}
