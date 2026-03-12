export function componentProjection(runtime) {
    const components = runtime?.components ?? {};
    const index = components.index ?? {};
    const definitions = index.definitions ?? {};
    const instances = index.instances ?? {};
    const instanceOverrides = index.instanceOverrides ?? {};
    const resolvedInstances = components.resolvedInstances ?? {};

    return {
        index: {
            definitions,
            instances,
            instanceOverrides,
        },
        resolvedInstances,
        counts: {
            definitions: Object.keys(definitions).length,
            instances: Object.keys(instances).length,
            resolvedInstances: Object.keys(resolvedInstances).length,
        },
    };
}
