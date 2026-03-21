import { snapDelta } from './snapEngine.js';
import { computeSnapTargets } from '@/runtime/snapping/computeSnapTargets.js';

function normalizeTarget(target) {
    if (target?.type === 'v' && Number.isFinite(target.x)) {
        return {
            axis: 'x',
            value: target.x,
            source: target.nodeId ?? null,
            weight: 1,
        };
    }

    if (target?.type === 'h' && Number.isFinite(target.y)) {
        return {
            axis: 'y',
            value: target.y,
            source: target.nodeId ?? null,
            weight: 1,
        };
    }

    if ((target?.axis === 'x' || target?.axis === 'y') && Number.isFinite(target.value)) {
        return {
            axis: target.axis,
            value: target.value,
            source: target.source ?? null,
            weight: Number.isFinite(target.weight) ? target.weight : 1,
        };
    }

    return null;
}

export function collectSnapTargets(state, dragState) {
    const excludedIds = Array.isArray(dragState?.nodeIds) ? dragState.nodeIds : [];
    return computeSnapTargets(state?.scene?.computed ?? {}, excludedIds)
        .map(normalizeTarget)
        .filter(Boolean);
}

function getAnchors(bounds, axis) {
    if (!bounds) return [];

    if (axis === 'x') {
        return [
            { kind: 'start', value: bounds.x },
            { kind: 'center', value: bounds.x + bounds.width / 2 },
            { kind: 'end', value: bounds.x + bounds.width },
        ];
    }

    return [
        { kind: 'start', value: bounds.y },
        { kind: 'center', value: bounds.y + bounds.height / 2 },
        { kind: 'end', value: bounds.y + bounds.height },
    ];
}

function resolveAxisSnap(axis, delta, bounds, context) {
    const threshold = Number.isFinite(context?.threshold) ? context.threshold : 6;
    const grid = Number.isFinite(context?.grid) ? context.grid : 10;
    const gridWeight = Number.isFinite(context?.gridWeight) ? context.gridWeight : 0.7;
    const targets = Array.isArray(context?.targets) ? context.targets : [];
    const anchors = getAnchors(bounds, axis);

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
        best = {
            delta: gridDelta,
            score: gridDistance / gridWeight,
            guide: null,
        };
    }

    for (const target of targets) {
        if (target.axis !== axis) continue;

        for (const anchor of anchors) {
            const offset = target.value - anchor.value;
            const candidateDelta = delta + offset;
            const distance = Math.abs(offset);
            if (distance > threshold) continue;

            const weight = Number.isFinite(target.weight) && target.weight > 0 ? target.weight : 1;
            const score = distance / weight;

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
