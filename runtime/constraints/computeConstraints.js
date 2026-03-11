function resolveConstraints(node) {
    return (
        node?.constraints ??
        node?.layout?.constraints ??
        {}
    );
}

function resolveHorizontalBehavior(constraints) {
    if (constraints?.horizontal) return constraints.horizontal;
    if (constraints?.centerX) return 'center';
    if (constraints?.left && constraints?.right) return 'stretch';
    if (constraints?.left) return 'left';
    if (constraints?.right) return 'right';
    return null;
}

function resolveVerticalBehavior(constraints) {
    if (constraints?.vertical) return constraints.vertical;
    if (constraints?.centerY) return 'center';
    if (constraints?.top && constraints?.bottom) return 'stretch';
    if (constraints?.top) return 'top';
    if (constraints?.bottom) return 'bottom';
    return null;
}

export function computeConstraints(node, parentBounds, delta) {
    const result = { ...(delta || {}) };
    const constraints = resolveConstraints(node);
    const horizontal = resolveHorizontalBehavior(constraints);
    const vertical = resolveVerticalBehavior(constraints);
    const aspectRatio = constraints?.aspectRatio ?? null;

    if (horizontal === 'center' && Number.isFinite(result.dx)) {
        result.dx = result.dx / 2;
    }

    if (vertical === 'center' && Number.isFinite(result.dy)) {
        result.dy = result.dy / 2;
    }

    if (horizontal === 'stretch' && parentBounds && Number.isFinite(result.width)) {
        result.width = result.width;
    }

    if (vertical === 'stretch' && parentBounds && Number.isFinite(result.height)) {
        result.height = result.height;
    }

    if (aspectRatio && Number.isFinite(result.width) && !Number.isFinite(result.height)) {
        result.height = result.width / aspectRatio;
    }

    if (aspectRatio && Number.isFinite(result.height) && !Number.isFinite(result.width)) {
        result.width = result.height * aspectRatio;
    }

    return result;
}
