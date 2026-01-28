export function getViewportBounds(viewport, screenSize) {
    const width = screenSize?.width ?? 0;
    const height = screenSize?.height ?? 0;
    const scale = viewport?.scale ?? 1;

    return {
        minX: viewport.x,
        minY: viewport.y,
        maxX: viewport.x + width / scale,
        maxY: viewport.y + height / scale,
    };
}
