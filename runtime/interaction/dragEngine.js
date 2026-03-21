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

export function computeDragDelta(dragState, options = {}) {
    let delta = computeRawDragDelta(dragState);
    delta = applyAxisLock(delta, options);
    let { dx, dy } = delta;

    if (typeof options.snapResolver === 'function') {
        const resolved = options.snapResolver(
            { dx, dy },
            {
                ...(options.snapContext || {}),
                dragState,
            },
        );

        if (resolved && Number.isFinite(resolved.dx) && Number.isFinite(resolved.dy)) {
            return {
                dx: resolved.dx,
                dy: resolved.dy,
                guides: Array.isArray(resolved.guides) ? resolved.guides : [],
            };
        }
    }

    if (options.snap) {
        const snapped =
            typeof options.snap === 'function'
                ? options.snap(delta, options.snapOptions)
                : snapDelta(delta, options.snapOptions);

        if (snapped && Number.isFinite(snapped.dx) && Number.isFinite(snapped.dy)) {
            dx = snapped.dx;
            dy = snapped.dy;
        }
    }

    return { dx, dy, guides: [] };
}
