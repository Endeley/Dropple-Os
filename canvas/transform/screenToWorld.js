export function screenToWorld(screenPoint, viewport) {
    return {
        x: viewport.x + screenPoint.x / viewport.scale,
        y: viewport.y + screenPoint.y / viewport.scale,
    };
}
