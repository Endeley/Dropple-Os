export function solveParentConstraint({
    constraint,
    controllerValues = {},
    nodeTransforms = {},
} = {}) {
    const childNode = constraint?.childNode;
    if (!childNode) return null;

    const sourceTransform =
        (constraint?.parentControllerId && controllerValues[constraint.parentControllerId]) ||
        (constraint?.parentNode && nodeTransforms[constraint.parentNode]) ||
        null;

    if (!sourceTransform) return null;

    return {
        nodeId: childNode,
        transform: {
            ...(nodeTransforms[childNode] || {}),
            ...sourceTransform,
        },
    };
}
