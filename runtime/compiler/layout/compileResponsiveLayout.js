export function compileResponsiveLayout(sceneGraph = {}) {
    const instructions = [];

    Object.entries(sceneGraph?.nodes ?? {}).forEach(([nodeId, node]) => {
        if (!node?.responsive) return;

        instructions.push({
            nodeId,
            type: 'responsiveLayout',
            rules: { ...node.responsive },
        });
    });

    return instructions;
}
