function deepFreeze(value) {
    if (!value || typeof value !== 'object') return value;
    Object.freeze(value);
    if (Array.isArray(value)) {
        value.forEach((item) => deepFreeze(item));
    } else {
        Object.keys(value).forEach((key) => deepFreeze(value[key]));
    }
    return value;
}

export function createTemplateSeed({
    id,
    version,
    snapshotHash,
    baseSceneGraph,
    states,
    defaultState,
    capabilityProfile,
    metadata,
    params,
}) {
    const seed = {
        id,
        version,
        snapshotHash,
        baseSceneGraph,
        states,
        defaultState,
        capabilityProfile,
        metadata,
        params,
    };

    return deepFreeze(seed);
}
