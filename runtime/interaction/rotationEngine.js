const TAU = Math.PI * 2;

function normalizeAngle(angle) {
    let next = angle;
    while (next > Math.PI) next -= TAU;
    while (next < -Math.PI) next += TAU;
    return next;
}

function angleBetween(center, point) {
    return Math.atan2(point.y - center.y, point.x - center.x);
}

export function computeRotationDelta(dragState) {
    const startPointer = dragState?.startPointer ?? null;
    const currentPointer = dragState?.currentPointer ?? null;
    const rotation = dragState?.rotation ?? null;
    const center = rotation?.center ?? null;

    if (!startPointer || !currentPointer || !center) {
        return { angle: 0 };
    }

    const startAngle = angleBetween(center, startPointer);
    const currentAngle = angleBetween(center, currentPointer);
    const delta = normalizeAngle(currentAngle - startAngle);

    return {
        angle: normalizeAngle((rotation?.originAngle ?? 0) + delta),
    };
}
