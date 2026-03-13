export function compileStyles(context) {
    const styles = {};

    for (const node of collectNodes(context.ir)) {
        styles[node.id] = node.styles || {};
    }

    context.styles = styles;
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
