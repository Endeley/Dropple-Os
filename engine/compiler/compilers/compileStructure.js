export function compileStructure(context) {
    const normalizedNodes = normalizeNodes(context.ir);

    context.structure = buildTree(normalizedNodes);
    context.metadata.normalizedNodes = normalizedNodes;
    context.metadata.nodeMap = Object.fromEntries(
        normalizedNodes.map((node) => [node.id, node]),
    );
}

function normalizeNodes(ir) {
    const nodeMap = new Map();
    const orderedIds = [];

    for (const entry of listRootEntries(ir)) {
        registerNode(entry, nodeMap, orderedIds);
    }

    return orderedIds.map((id) => nodeMap.get(id));
}

function listRootEntries(ir) {
    if (Array.isArray(ir?.nodes)) {
        return ir.nodes;
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

function registerNode(entry, nodeMap, orderedIds) {
    const node = normalizeNode(entry);
    if (!node) {
        return;
    }

    if (!nodeMap.has(node.id)) {
        orderedIds.push(node.id);
    }

    nodeMap.set(node.id, node);

    for (const childEntry of node.children) {
        registerNode(childEntry, nodeMap, orderedIds);
    }
}

function normalizeNode(entry) {
    if (!entry || typeof entry !== 'object') {
        return null;
    }

    if (!entry.id) {
        return null;
    }

    return {
        id: entry.id,
        type: entry.type || 'div',
        layout: entry.layout || null,
        constraints: entry.constraints || null,
        styles: entry.styles || {},
        props: entry.props || {},
        binding: normalizeBinding(entry.binding),
        children: Array.isArray(entry.children) ? entry.children : [],
    };
}

function buildTree(nodes) {
    const nestedById = new Map(
        nodes.map((node) => [
            node.id,
            {
                id: node.id,
                type: node.type,
                props: node.props,
                binding: node.binding,
                children: [],
            },
        ]),
    );
    const childIds = new Set();

    for (const node of nodes) {
        const nestedNode = nestedById.get(node.id);
        nestedNode.children = node.children
            .map((child) => (typeof child === 'string' ? child : child?.id))
            .filter(Boolean)
            .map((childId) => {
                childIds.add(childId);
                return nestedById.get(childId);
            })
            .filter(Boolean);
    }

    return nodes
        .filter((node) => !childIds.has(node.id))
        .map((node) => nestedById.get(node.id));
}

function normalizeBinding(binding) {
    if (!binding || typeof binding !== 'object' || Array.isArray(binding)) {
        return null;
    }

    return Object.fromEntries(
        Object.entries(binding).sort(([left], [right]) => left.localeCompare(right)),
    );
}
