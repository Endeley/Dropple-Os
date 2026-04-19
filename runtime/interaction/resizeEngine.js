function normalizeDelta(delta) {
    return {
        x: Number.isFinite(delta?.dx) ? delta.dx : Number.isFinite(delta?.x) ? delta.x : 0,
        y: Number.isFinite(delta?.dy) ? delta.dy : Number.isFinite(delta?.y) ? delta.y : 0,
    };
}

export function computeResizeDelta(dragState, delta) {
    const originBounds = dragState?.bounds ?? dragState?.resize?.originBounds ?? null;
    const handle = dragState?.resize?.handle ?? 'se';

    if (!originBounds) {
        return null;
    }

    const normalizedDelta = normalizeDelta(delta);
    const next = {
        x: originBounds.x,
        y: originBounds.y,
        width: originBounds.width,
        height: originBounds.height,
    };

    if (handle.includes('w') || handle.includes('e')) {
        const anchorX = handle.includes('w') ? originBounds.x + originBounds.width : originBounds.x;
        const movedX = handle.includes('w') ? originBounds.x + normalizedDelta.x : originBounds.x + originBounds.width + normalizedDelta.x;

        next.x = Math.min(anchorX, movedX);
        next.width = Math.max(1, Math.abs(movedX - anchorX));
    }

    if (handle.includes('n') || handle.includes('s')) {
        const anchorY = handle.includes('n') ? originBounds.y + originBounds.height : originBounds.y;
        const movedY = handle.includes('n') ? originBounds.y + normalizedDelta.y : originBounds.y + originBounds.height + normalizedDelta.y;

        next.y = Math.min(anchorY, movedY);
        next.height = Math.max(1, Math.abs(movedY - anchorY));
    }

    return next;
}

export default computeResizeDelta;
