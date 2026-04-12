import { snapDelta } from './snapEngine.js';

export function computeRawDragDelta(dragState) {
    const startPointer = dragState?.startPointer ?? null;
    const currentPointer = dragState?.currentPointer ?? null;

    if (!startPointer || !currentPointer) {
        return { dx: 0, dy: 0 };
    }

    return {
        dx: currentPointer.x - startPointer.x,
        dy: currentPointer.y - startPointer.y,
    };
}

export function applyAxisLock(delta, options = {}) {
    if (options.axisLock !== true) return delta;

    let { dx, dy } = delta;

    if (Math.abs(dx) > Math.abs(dy)) {
        dy = 0;
    } else {
        dx = 0;
    }

    return {
        ...delta,
        dx,
        dy,
    };
}

/**
 * 🔑 NEW: resolves animation base transform (read-only)
 */
function resolveBaseTransform(nodeId, runtime) {
    const computed = runtime?.scene?.computed?.transforms?.[nodeId];
    if (computed) return computed;

    return null;
}

/**
 * 🔑 NEW: builds interaction layer (non-mutating)
 */
function buildInteractionTransform(nodeId, delta, runtime) {
    const base = resolveBaseTransform(nodeId, runtime);

    const baseX = base?.x ?? 0;
    const baseY = base?.y ?? 0;

    return {
        x: baseX + delta.dx,
        y: baseY + delta.dy,
    };
}

export function computeDragDelta(dragState, options = {}) {
    let delta = computeRawDragDelta(dragState);
    delta = applyAxisLock(delta, options);

    let { dx, dy } = delta;
    let guides = [];

    // 🔑 Snap resolver (priority)
    if (typeof options.snapResolver === 'function') {
        const resolved = options.snapResolver(
            { dx, dy },
            {
                ...(options.snapContext || {}),
                dragState,
            },
        );

        if (resolved && Number.isFinite(resolved.dx) && Number.isFinite(resolved.dy)) {
            dx = resolved.dx;
            dy = resolved.dy;
            guides = Array.isArray(resolved.guides) ? resolved.guides : [];
        }
    }
    // 🔑 Grid / fallback snap
    else if (options.snap) {
        const snapped = typeof options.snap === 'function' ? options.snap(delta, options.snapOptions) : snapDelta(delta, options.snapOptions);

        if (snapped && Number.isFinite(snapped.dx) && Number.isFinite(snapped.dy)) {
            dx = snapped.dx;
            dy = snapped.dy;
        }
    }

    // 🔑 NEW: build interaction transforms per node
    const runtime = options.runtime ?? null;
    const nodeIds = dragState?.nodeIds ?? [];

    let interactionTransforms = null;

    if (runtime && nodeIds.length > 0) {
        interactionTransforms = {};

        for (const nodeId of nodeIds) {
            interactionTransforms[nodeId] = buildInteractionTransform(nodeId, { dx, dy }, runtime);
        }
    }

    return {
        dx,
        dy,
        guides,
        // 🔑 NEW OUTPUT
        interactionTransforms,
    };
}
