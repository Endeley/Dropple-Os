function normalizeBounds(bounds) {
    let { x, y, width, height } = bounds;

    if (width < 0) {
        x += width;
        width = Math.abs(width);
    }

    if (height < 0) {
        y += height;
        height = Math.abs(height);
    }

    return {
        x,
        y,
        width,
        height,
    };
}

export function computeResizeDelta(dragState, delta) {
    const resize = dragState?.resize ?? null;
    const handle = resize?.handle ?? null;
    const originBounds = resize?.originBounds ?? null;

    if (!handle || !originBounds) return null;

    const {
        x = 0,
        y = 0,
        width = 0,
        height = 0,
    } = originBounds;
    const dx = delta?.dx ?? 0;
    const dy = delta?.dy ?? 0;

    const next = {
        x,
        y,
        width,
        height,
    };

    if (handle.includes('e')) {
        next.width = width + dx;
    }

    if (handle.includes('s')) {
        next.height = height + dy;
    }

    if (handle.includes('w')) {
        next.x = x + dx;
        next.width = width - dx;
    }

    if (handle.includes('n')) {
        next.y = y + dy;
        next.height = height - dy;
    }

    return normalizeBounds(next);
}
