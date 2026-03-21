import { snapDelta } from './snapEngine.js';

export function computeDragDelta(dragState, options = {}) {
    const startPointer = dragState?.startPointer ?? null;
    const currentPointer = dragState?.currentPointer ?? null;

    if (!startPointer || !currentPointer) {
        return { dx: 0, dy: 0 };
    }

    let dx = currentPointer.x - startPointer.x;
    let dy = currentPointer.y - startPointer.y;

    if (options.axisLock === true) {
        if (Math.abs(dx) > Math.abs(dy)) {
            dy = 0;
        } else {
            dx = 0;
        }
    }

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
                ? options.snap({ dx, dy }, options.snapOptions)
                : snapDelta({ dx, dy }, options.snapOptions);

        if (snapped && Number.isFinite(snapped.dx) && Number.isFinite(snapped.dy)) {
            dx = snapped.dx;
            dy = snapped.dy;
        }
    }

    return { dx, dy, guides: [] };
}
