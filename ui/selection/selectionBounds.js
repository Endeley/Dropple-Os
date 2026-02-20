import { computeSelectionBounds as computeBounds } from '@/runtime/geometry/selectionBounds.js';

export function computeSelectionBounds(nodes = []) {
    if (!nodes.length) return null;

    const bounds = computeBounds(nodes);

    return {
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.width,
        height: bounds.height,
    };
}
