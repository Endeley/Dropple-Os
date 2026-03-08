export function unwrapNode({ nodes = {}, rootIds = [], nodeId }) {
    if (!nodeId || !nodes[nodeId]) {
        return { nodes, rootIds };
    }

    const wrapper = nodes[nodeId];
    const childIds = Array.isArray(wrapper.children) ? [...wrapper.children] : [];
    const parentId = wrapper.parentId ?? null;
    if (!childIds.length) {
        return { nodes, rootIds };
    }

    const nextNodes = { ...nodes };

    childIds.forEach((childId) => {
        const child = nextNodes[childId];
        if (!child) return;
        nextNodes[childId] = {
            ...child,
            parentId,
        };
    });

    if (parentId != null) {
        const parent = nextNodes[parentId];
        if (!parent) {
            return { nodes, rootIds };
        }

        const siblings = Array.isArray(parent.children) ? [...parent.children] : [];
        const wrapperIndex = siblings.indexOf(nodeId);
        if (wrapperIndex < 0) {
            return { nodes, rootIds };
        }

        const nextChildren = [
            ...siblings.slice(0, wrapperIndex),
            ...childIds,
            ...siblings.slice(wrapperIndex + 1),
        ];

        nextNodes[parentId] = {
            ...parent,
            children: nextChildren,
        };
    }

    delete nextNodes[nodeId];

    if (parentId != null) {
        return {
            nodes: nextNodes,
            rootIds: rootIds.filter((id) => id !== nodeId),
        };
    }

    const nextRootIds = [];
    (rootIds || []).forEach((id) => {
        if (id === nodeId) {
            nextRootIds.push(...childIds);
        } else {
            nextRootIds.push(id);
        }
    });

    return {
        nodes: nextNodes,
        rootIds: nextRootIds,
    };
}
