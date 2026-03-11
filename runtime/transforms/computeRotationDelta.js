const TAU = Math.PI * 2;

function normalizeAngle(angle) {
    let next = angle;
    while (next > Math.PI) next -= TAU;
    while (next < -Math.PI) next += TAU;
    return next;
}

export function computeRotationDelta(startPointer, pointer, pivot) {
    if (!startPointer || !pointer || !pivot) {
        return { rotation: 0 };
    }

    const startAngle = Math.atan2(
        startPointer.y - pivot.y,
        startPointer.x - pivot.x,
    );
    const currentAngle = Math.atan2(
        pointer.y - pivot.y,
        pointer.x - pivot.x,
    );

    return {
        rotation: normalizeAngle(currentAngle - startAngle),
    };
}
