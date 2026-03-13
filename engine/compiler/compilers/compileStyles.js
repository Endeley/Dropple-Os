export function compileStyles(context) {
    const styles = {};

    for (const node of collectNodes(context)) {
        styles[node.id] = node.styles || {};
    }

    context.styles = styles;
}

function collectNodes(context) {
    return context.metadata.normalizedNodes || [];
}
