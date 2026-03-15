const EMPTY_COLLECTION = Object.freeze({});

export function createRig({
    id,
    rootNode = null,
    controllers = EMPTY_COLLECTION,
    constraints = EMPTY_COLLECTION,
    bones = EMPTY_COLLECTION,
} = {}) {
    if (!id) return null;

    return {
        id,
        rootNode,
        controllers: { ...controllers },
        constraints: { ...constraints },
        bones: { ...bones },
    };
}

export function createRigController({
    id,
    label = '',
    nodeRef = null,
    channels = [],
} = {}) {
    if (!id) return null;

    return {
        id,
        label,
        nodeRef,
        channels: Array.isArray(channels) ? [...channels] : [],
    };
}

export function createRigConstraint({
    id,
    type,
    parentNode = null,
    childNode = null,
    parentControllerId = null,
    inputs = [],
    outputs = [],
} = {}) {
    if (!id || !type) return null;

    return {
        id,
        type,
        parentNode,
        childNode,
        parentControllerId,
        inputs: Array.isArray(inputs) ? [...inputs] : [],
        outputs: Array.isArray(outputs) ? [...outputs] : [],
    };
}
