export function computeTransformAnchor(bounds) {
    if (!bounds) return null;

    return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
    };
}
