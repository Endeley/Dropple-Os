export function resolveComputedValues(resolvedBindings) {
    const result = {};
    const nodeIds = Object.keys(resolvedBindings ?? {}).sort();

    for (const nodeId of nodeIds) {
        const props = Object.keys(resolvedBindings[nodeId] ?? {}).sort();
        result[nodeId] = {};

        for (const prop of props) {
            result[nodeId][prop] = resolvedBindings[nodeId][prop];
        }
    }

    return result;
}
