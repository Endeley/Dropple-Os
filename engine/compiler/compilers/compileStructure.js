export function compileStructure(context) {
    const nodes = collectNodes(context.ir);
    const byId = new Map(nodes.map((node) => [node.id, node]));

    const tree = nodes.map((node) => ({
        id: node.id,
        type: node.type,
        children: normalizeChildren(node.children, byId),
    }));

    context.structure = tree;
}

function collectNodes(ir) {
    if (Array.isArray(ir?.nodes)) {
        return ir.nodes
            .filter((node) => node && node.id)
            .map((node) => ({
                id: node.id,
                type: node.type || 'div',
                children: Array.isArray(node.children) ? [...node.children] : [],
            }));
    }

    const sceneNodes = ir?.scene?.nodes;
    if (!sceneNodes || typeof sceneNodes !== 'object') {
        return [];
    }

    return Object.keys(sceneNodes)
        .sort()
        .map((id) => {
            const node = sceneNodes[id] || {};
            return {
                id,
                type: node.type || 'div',
                children: Array.isArray(node.children) ? [...node.children] : [],
            };
        });
}

function normalizeChildren(children, byId) {
    return children.filter((childId) => byId.has(childId));
}
