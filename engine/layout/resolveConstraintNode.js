import { buildComputedLayout } from './layoutTypes.js';

function offsetOr(value) {
    return Number.isFinite(value) ? value : 0;
}

export function resolveConstraintNode({
    nodeId,
    parentBox,
    layoutNode,
    baseGeometry = {},
    revision = 0,
} = {}) {
    const base = baseGeometry?.[nodeId] ?? {};
    const constraints = layoutNode?.constraints ?? {};

    let x = base.x ?? 0;
    let y = base.y ?? 0;
    let width = base.width ?? 0;
    let height = base.height ?? 0;

    if (!parentBox) {
        return buildComputedLayout({ x, y, width, height, revision });
    }

    const offsetLeft = offsetOr(layoutNode?.offsetLeft);
    const offsetRight = offsetOr(layoutNode?.offsetRight);
    const offsetTop = offsetOr(layoutNode?.offsetTop);
    const offsetBottom = offsetOr(layoutNode?.offsetBottom);

    if (constraints.left && constraints.right) {
        x = parentBox.x + offsetLeft;
        width = Math.max(0, parentBox.width - offsetLeft - offsetRight);
    } else if (constraints.left) {
        x = parentBox.x + offsetLeft;
    } else if (constraints.right) {
        x = parentBox.x + parentBox.width - width - offsetRight;
    }

    if (constraints.centerX) {
        x = parentBox.x + parentBox.width / 2 - width / 2;
    }

    if (constraints.top && constraints.bottom) {
        y = parentBox.y + offsetTop;
        height = Math.max(0, parentBox.height - offsetTop - offsetBottom);
    } else if (constraints.top) {
        y = parentBox.y + offsetTop;
    } else if (constraints.bottom) {
        y = parentBox.y + parentBox.height - height - offsetBottom;
    }

    if (constraints.centerY) {
        y = parentBox.y + parentBox.height / 2 - height / 2;
    }

    return buildComputedLayout({ x, y, width, height, revision });
}
