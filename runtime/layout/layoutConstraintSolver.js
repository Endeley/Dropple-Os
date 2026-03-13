function getNodeBox(scene, nodeId) {
    const node = scene?.nodes?.[nodeId];
    if (!node) return null;

    const layout = node.layout ?? {};
    const transform = node.props?.transform ?? {};

    return {
        x: layout.x ?? node.x ?? transform.x ?? 0,
        y: layout.y ?? node.y ?? transform.y ?? 0,
        width: layout.width ?? node.width ?? transform.width ?? 0,
        height: layout.height ?? node.height ?? transform.height ?? 0,
        parentId: node.parentId ?? node.parent ?? null,
    };
}

export function layoutConstraintSolver(scene, constraints = []) {
    const computed = {};

    for (const instruction of constraints) {
        const node = getNodeBox(scene, instruction?.nodeId);
        if (!node) continue;

        const parent = node.parentId ? getNodeBox(scene, node.parentId) : null;
        const current = instruction?.constraints ?? {};

        let x = node.x;
        let y = node.y;

        if (current.left && parent) {
            x = parent.x;
        }

        if (current.right && parent) {
            x = parent.x + parent.width - node.width;
        }

        if (current.centerX && parent) {
            x = parent.x + (parent.width - node.width) / 2;
        }

        if (current.top && parent) {
            y = parent.y;
        }

        if (current.bottom && parent) {
            y = parent.y + parent.height - node.height;
        }

        if (current.centerY && parent) {
            y = parent.y + (parent.height - node.height) / 2;
        }

        computed[instruction.nodeId] = {
            x,
            y,
            width: node.width,
            height: node.height,
        };
    }

    return computed;
}
