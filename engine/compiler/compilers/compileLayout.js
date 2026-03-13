export function compileLayout(context) {
    const layouts = {};

    for (const node of collectNodes(context.ir)) {
        layouts[node.id] = {
            layout: node.layout || 'absolute',
            constraints: node.constraints || null,
        };
    }

    context.layout = layouts;
}

function collectNodes(ir) {
    if (Array.isArray(ir?.nodes)) {
        return ir.nodes.filter((node) => node && node.id);
    }

    const sceneNodes = ir?.scene?.nodes;
    if (!sceneNodes || typeof sceneNodes !== 'object') {
        return [];
    }

    return Object.keys(sceneNodes)
        .sort()
        .map((id) => ({
            id,
            ...sceneNodes[id],
        }));
}
