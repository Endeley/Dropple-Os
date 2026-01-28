export function nodeBounds(node) {
    return {
        x: node.x ?? 0,
        y: node.y ?? 0,
        width: node.width ?? 0,
        height: node.height ?? 0,
    };
}

export function distancePointToRect(point, rect) {
    const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width));
    const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height));
    return Math.hypot(dx, dy);
}

export function closestPointOnRect(point, rect) {
    const minX = rect.x;
    const maxX = rect.x + rect.width;
    const minY = rect.y;
    const maxY = rect.y + rect.height;

    return {
        x: clamp(point.x, minX, maxX),
        y: clamp(point.y, minY, maxY),
    };
}

export function classifyRelation(distance, edgeMargin) {
    if (distance === 0) return 'inside';
    if (distance <= edgeMargin) return 'edge';
    return 'near';
}

export function findNearestNodes({
    worldPoint,
    nodes,
    radius,
    maxResults = 5,
    edgeMargin = 6,
}) {
    if (!worldPoint || !Array.isArray(nodes)) return [];
    const results = nodes
        .map((node) => {
            const bounds = nodeBounds(node);
            const distance = distancePointToRect(worldPoint, bounds);
            const nearestPoint = closestPointOnRect(worldPoint, bounds);
            return {
                node,
                bounds,
                distance,
                nearestPoint,
                relation: classifyRelation(distance, edgeMargin),
            };
        })
        .filter((result) => result.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxResults);

    return results;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
