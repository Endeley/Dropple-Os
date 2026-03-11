import { computeAlignmentGuides } from '@/runtime/snapping/computeAlignmentGuides.js';
import { computeSnapDelta } from '@/runtime/snapping/computeSnapDelta.js';

function clampToMinimum(startBounds, resize, delta) {
    const nextWidth = startBounds.width + resize.width;
    const nextHeight = startBounds.height + resize.height;

    if (nextWidth < 1) {
        const correction = 1 - nextWidth;
        resize.width += correction;
        if (delta.x !== 0) {
            delta.x -= correction;
        }
    }

    if (nextHeight < 1) {
        const correction = 1 - nextHeight;
        resize.height += correction;
        if (delta.y !== 0) {
            delta.y -= correction;
        }
    }
}

export function computeResizeDelta(
    startPointer,
    pointer,
    startBounds,
    handle = 'se',
    targets = [],
) {
    if (!startPointer || !pointer || !startBounds) {
        return {
            resize: { width: 0, height: 0 },
            delta: { x: 0, y: 0 },
            bounds: null,
            guides: [],
        };
    }

    const dx = pointer.x - startPointer.x;
    const dy = pointer.y - startPointer.y;
    const resize = { width: 0, height: 0 };
    const delta = { x: 0, y: 0 };

    if (handle.includes('e')) {
        resize.width += dx;
    }
    if (handle.includes('s')) {
        resize.height += dy;
    }
    if (handle.includes('w')) {
        resize.width -= dx;
        delta.x += dx;
    }
    if (handle.includes('n')) {
        resize.height -= dy;
        delta.y += dy;
    }

    clampToMinimum(startBounds, resize, delta);

    const bounds = {
        x: startBounds.x + delta.x,
        y: startBounds.y + delta.y,
        width: Math.max(1, startBounds.width + resize.width),
        height: Math.max(1, startBounds.height + resize.height),
    };
    const snap = computeSnapDelta(bounds, targets);

    if (snap.snapX !== 0) {
        if (handle.includes('w') && !handle.includes('e')) {
            delta.x += snap.snapX;
            resize.width -= snap.snapX;
        } else {
            resize.width += snap.snapX;
        }
    }

    if (snap.snapY !== 0) {
        if (handle.includes('n') && !handle.includes('s')) {
            delta.y += snap.snapY;
            resize.height -= snap.snapY;
        } else {
            resize.height += snap.snapY;
        }
    }

    clampToMinimum(startBounds, resize, delta);

    const snappedBounds = {
        x: startBounds.x + delta.x,
        y: startBounds.y + delta.y,
        width: Math.max(1, startBounds.width + resize.width),
        height: Math.max(1, startBounds.height + resize.height),
    };

    return {
        resize,
        delta,
        bounds: snappedBounds,
        guides: computeAlignmentGuides(snappedBounds, targets),
    };
}
