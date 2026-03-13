export function compileLayout(context) {
    const layouts = {};

    for (const node of collectNodes(context)) {
        const layout = normalizeLayout(node);
        layouts[node.id] = {
            ...layout,
            constraints: node.constraints || null,
        };
    }

    context.layout = layouts;
}

function collectNodes(context) {
    return context.metadata.normalizedNodes || [];
}

function normalizeLayout(node) {
    if (!node?.layout) {
        return {
            type: inferLayoutType(node),
            layout: 'absolute',
        };
    }

    if (typeof node.layout === 'string') {
        return {
            type: normalizeType(node.layout, node),
            layout: node.layout,
        };
    }

    return {
        ...node.layout,
        type: normalizeType(node.layout.type, node),
        layout: node.layout.type || node.layout.layout || 'absolute',
    };
}

function inferLayoutType(node) {
    return normalizeType(null, node);
}

function normalizeType(type, node) {
    const value = String(type || node?.type || '').toLowerCase();

    switch (value) {
        case 'stack':
            return 'Stack';
        case 'row':
            return 'Row';
        case 'grid':
            return 'Grid';
        case 'container':
            return 'Container';
        case 'spacer':
            return 'Spacer';
        default:
            return null;
    }
}
