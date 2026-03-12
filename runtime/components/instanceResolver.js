import { applyOverrides } from './overrideResolver.js';

function cloneNodeSubtree(nodeId, sceneGraph) {
    const nodes = sceneGraph?.nodes ?? {};
    const source = nodes[nodeId];
    if (!source) return null;

    return {
        ...structuredClone(source),
        children: (source.children || [])
            .map((childId) => cloneNodeSubtree(childId, sceneGraph))
            .filter(Boolean),
    };
}

export function resolveInstance(component, overrides, sceneGraph) {
    if (!component?.rootNodeId) return null;

    const resolved = cloneNodeSubtree(component.rootNodeId, sceneGraph);
    if (!resolved) return null;

    return applyOverrides(resolved, overrides);
}
