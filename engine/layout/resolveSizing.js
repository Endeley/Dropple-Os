function finiteOr(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

function clampSize(value, min, max) {
    let next = finiteOr(value, 0);
    if (Number.isFinite(min)) next = Math.max(next, min);
    if (Number.isFinite(max)) next = Math.min(next, max);
    return next;
}

export function resolveSizing({
    sizing,
    intrinsicSize = 0,
    availableSpace = 0,
} = {}) {
    const mode = sizing?.mode ?? 'fixed';
    const value = sizing?.value ?? null;

    switch (mode) {
        case 'hug':
            return clampSize(
                intrinsicSize,
                sizing?.min ?? sizing?.minSize ?? null,
                sizing?.max ?? sizing?.maxSize ?? null,
            );

        case 'fill':
            return clampSize(
                availableSpace,
                sizing?.min ?? sizing?.minSize ?? null,
                sizing?.max ?? sizing?.maxSize ?? null,
            );

        case 'percent':
            return clampSize(
                (availableSpace * finiteOr(value, 0)) / 100,
                sizing?.min ?? sizing?.minSize ?? null,
                sizing?.max ?? sizing?.maxSize ?? null,
            );

        case 'fixed':
        default:
            return clampSize(
                value ?? intrinsicSize,
                sizing?.min ?? sizing?.minSize ?? null,
                sizing?.max ?? sizing?.maxSize ?? null,
            );
    }
}
