import { computeSelectionBounds } from './computeSelectionBounds.js';

export function selectionBoundsProjection(runtime) {
    const bounds = computeSelectionBounds(runtime);

    if (!bounds) {
        return Object.freeze({
            bounds: null,
            center: null,
        });
    }

    return Object.freeze({
        bounds: Object.freeze({
            ...bounds,
        }),
        center: Object.freeze({
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
        }),
    });
}
