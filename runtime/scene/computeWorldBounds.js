import { applyMatrix } from '../math/matrix2d.js';

function resolveNodeSize(node) {
    const transform = node?.props?.transform ?? {};
    const size = node?.props?.size ?? {};
    const layout = node?.layout ?? {};

    return {
        width: layout.width ?? size.width ?? node?.width ?? transform.width ?? 0,
        height: layout.height ?? size.height ?? node?.height ?? transform.height ?? 0,
    };
}

export function computeWorldBounds(node, worldTransform) {
    const { width, height } = resolveNodeSize(node);

    const p1 = applyMatrix(worldTransform, { x: 0, y: 0 });
    const p2 = applyMatrix(worldTransform, { x: width, y: 0 });
    const p3 = applyMatrix(worldTransform, { x: width, y: height });
    const p4 = applyMatrix(worldTransform, { x: 0, y: height });

    const xs = [p1.x, p2.x, p3.x, p4.x];
    const ys = [p1.y, p2.y, p3.y, p4.y];

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}
