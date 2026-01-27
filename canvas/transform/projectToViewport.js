export function projectToViewport(worldPoint, viewport) {
    return {
        x: (worldPoint.x - viewport.x) * viewport.scale,
        y: (worldPoint.y - viewport.y) * viewport.scale,
    };
}
