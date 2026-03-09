export function buildLayoutBox(x, y, width, height) {
    return { x, y, width, height };
}

export function buildComputedLayout({ x = 0, y = 0, width = 0, height = 0, revision = 0 } = {}) {
    return {
        x,
        y,
        width,
        height,
        contentBox: buildLayoutBox(x, y, width, height),
        paddingBox: buildLayoutBox(x, y, width, height),
        revision,
    };
}
