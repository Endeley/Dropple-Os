import { snapDelta } from './snapEngine.js';

export function computeDragDelta(dragState, options = {}) {
    const startPointer = dragState?.startPointer ?? null;
    const currentPointer = dragState?.currentPointer ?? null;

    if (!startPointer || !currentPointer) {
        return { dx: 0, dy: 0 };
    }

    let dx = currentPointer.x - startPointer.x;
    let dy = currentPointer.y - startPointer.y;

    if (options.snap === true) {
        const snapped = snapDelta({ dx, dy }, options.snapOptions);
        if (snapped && Number.isFinite(snapped.dx) && Number.isFinite(snapped.dy)) {
            dx = snapped.dx;
            dy = snapped.dy;
        }
    } else if (typeof options.snap === 'function') {
        const snapped = options.snap({ dx, dy });
        if (snapped && Number.isFinite(snapped.dx) && Number.isFinite(snapped.dy)) {
            dx = snapped.dx;
            dy = snapped.dy;
        }
    }

    return { dx, dy };
}
