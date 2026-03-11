export function computeResizeAnchors(bounds) {
    if (!bounds) return null;

    const { x, y, width, height } = bounds;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const r = x + width;
    const b = y + height;

    return {
        n: { x: cx, y },
        ne: { x: r, y },
        e: { x: r, y: cy },
        se: { x: r, y: b },
        s: { x: cx, y: b },
        sw: { x, y: b },
        w: { x, y: cy },
        nw: { x, y },
    };
}
