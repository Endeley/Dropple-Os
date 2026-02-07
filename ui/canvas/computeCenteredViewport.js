export function computeCenteredViewport({ width, height, scale }) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(scale) || scale === 0) {
        return null;
    }

    return {
        x: -width / 2 / scale,
        y: -height / 2 / scale,
        scale,
    };
}
