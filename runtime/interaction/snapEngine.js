export function snapDelta({ dx, dy }, { grid = 1 } = {}) {
    const size = Number.isFinite(grid) && grid > 0 ? grid : 1;

    return {
        dx: Math.round(dx / size) * size,
        dy: Math.round(dy / size) * size,
    };
}
