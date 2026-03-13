export function compileLayout(context) {
    const layouts = {};

    for (const node of collectNodes(context)) {
        layouts[node.id] = {
            layout: node.layout || 'absolute',
            constraints: node.constraints || null,
        };
    }

    context.layout = layouts;
}

function collectNodes(context) {
    return context.metadata.normalizedNodes || [];
}
