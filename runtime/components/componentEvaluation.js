import { resolveInstance } from './instanceResolver.js';

export function evaluateComponents(document, runtime) {
    const componentSystem = document?.components ?? {};
    const definitions = componentSystem.definitions ?? {};
    const instances = componentSystem.instances ?? {};
    const instanceOverrides = componentSystem.instanceOverrides ?? {};
    const resolvedInstances = {};

    for (const [instanceId, instance] of Object.entries(instances)) {
        const component = definitions[instance.componentId];
        if (!component) continue;

        const resolved = resolveInstance(
            component,
            instanceOverrides[instanceId],
            document?.sceneGraph ?? { nodes: {}, rootIds: [] },
        );

        if (resolved) {
            resolvedInstances[instanceId] = resolved;
        }
    }

    return {
        ...runtime,
        components: {
            index: {
                definitions,
                instances,
                instanceOverrides,
            },
            resolvedInstances,
        },
    };
}
