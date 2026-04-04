export function compileConstraints(layout = {}) {
    const instructions = [];

    Object.entries(layout?.nodes ?? {}).forEach(([nodeId, node]) => {
        const constraints = node?.constraints;
        if (!constraints) return;

        instructions.push({
            nodeId,
            type: 'constraints',
            constraints: { ...constraints },
        });
    });

    return instructions;
}
