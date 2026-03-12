function getValueByPath(obj, path) {
    const parts = String(path ?? '').split('.');
    let current = obj;

    for (const part of parts) {
        if (!part) continue;
        if (current == null) return undefined;
        current = current[part];
    }

    return current;
}

export function resolveBindings(bindings, variables) {
    const resolved = {};
    const nodeIds = Object.keys(bindings ?? {}).sort();

    for (const nodeId of nodeIds) {
        const nodeBindings = bindings[nodeId] ?? {};
        const props = Object.keys(nodeBindings).sort();
        resolved[nodeId] = {};

        for (const prop of props) {
            resolved[nodeId][prop] = getValueByPath(variables, nodeBindings[prop]);
        }
    }

    return resolved;
}
