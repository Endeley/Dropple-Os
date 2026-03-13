export function compileConstraints(sceneGraph = {}) {
    const instructions = [];

    Object.entries(sceneGraph?.nodes ?? {}).forEach(([nodeId, node]) => {
        const constraints = node?.layout?.constraints;
        if (!constraints) return;

        instructions.push({
            nodeId,
            type: 'constraints',
            constraints: { ...constraints },
        });
    });

    return instructions;
}
