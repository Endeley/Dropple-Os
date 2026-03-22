export function buildGroupSnapContext(bounds) {
    if (!bounds) return null;
    return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        center: bounds.center ?? {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
        },
    };
}
