import { solveConstraints } from './solveConstraints.js';

export function evaluateRig({
    rig,
    controllerValues = {},
    nodeTransforms = {},
} = {}) {
    if (!rig?.id) {
        return {
            rigId: null,
            controllerValues: {},
            constrainedNodes: {},
        };
    }

    return {
        rigId: rig.id,
        controllerValues: { ...controllerValues },
        constrainedNodes: solveConstraints({
            rig,
            controllerValues,
            nodeTransforms,
        }),
    };
}
