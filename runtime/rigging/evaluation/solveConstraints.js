import { solveParentConstraint } from '../constraints/parentConstraint.js';

export function solveConstraints({
    rig,
    controllerValues = {},
    nodeTransforms = {},
} = {}) {
    const constraints = Object.values(rig?.constraints || {});
    const resolved = {};

    for (const constraint of constraints) {
        if (constraint?.type !== 'parent') continue;

        const result = solveParentConstraint({
            constraint,
            controllerValues,
            nodeTransforms: {
                ...nodeTransforms,
                ...resolved,
            },
        });

        if (!result?.nodeId) continue;
        resolved[result.nodeId] = result.transform;
    }

    return resolved;
}
