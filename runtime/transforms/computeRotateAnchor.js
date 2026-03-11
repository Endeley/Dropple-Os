export const ROTATE_OFFSET = 24;

export function computeRotateAnchor(bounds) {
    if (!bounds) return null;

    return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y - ROTATE_OFFSET,
    };
}
