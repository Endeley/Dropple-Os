import { EventTypes } from '../eventTypes.js';

/**
 * Component identity reducer
 *
 * 🔒 Rules:
 * - Pure
 * - Deterministic
 * - No side effects
 * - No validation logic
 */
export function componentStateReducers(state, event) {
    const documentComponents = state?.document?.components ?? {
        definitions: {},
        instances: {},
        instanceOverrides: {},
    };

    switch (event.type) {
        case EventTypes.COMPONENT_CREATE: {
            const { componentId, rootNodeId } = event.payload || {};
            if (!componentId || !rootNodeId) return state;

            return {
                ...state,
                document: {
                    ...state.document,
                    components: {
                        ...documentComponents,
                        definitions: {
                            ...documentComponents.definitions,
                            [componentId]: { rootNodeId },
                        },
                    },
                },
            };
        }

        case EventTypes.COMPONENT_INSTANCE_CREATE: {
            const { instanceId, componentId } = event.payload || {};
            if (!instanceId || !componentId) return state;

            return {
                ...state,
                document: {
                    ...state.document,
                    components: {
                        ...documentComponents,
                        instances: {
                            ...documentComponents.instances,
                            [instanceId]: { componentId },
                        },
                    },
                },
            };
        }

        case EventTypes.COMPONENT_INSTANCE_OVERRIDE_SET: {
            const { instanceId, nodeId, prop, value } = event.payload || {};
            if (!instanceId || !nodeId || !prop) return state;

            const prevInstanceOverrides = documentComponents.instanceOverrides?.[instanceId] ?? {};
            const prevNodeOverrides = prevInstanceOverrides[nodeId] ?? {};

            return {
                ...state,
                document: {
                    ...state.document,
                    components: {
                        ...documentComponents,
                        instanceOverrides: {
                            ...documentComponents.instanceOverrides,
                            [instanceId]: {
                                ...prevInstanceOverrides,
                                [nodeId]: {
                                    ...prevNodeOverrides,
                                    [prop]: value,
                                },
                            },
                        },
                    },
                },
            };
        }

        case EventTypes.COMPONENT_INSTANCE_DETACH: {
            const { instanceId } = event.payload || {};
            if (!instanceId) return state;

            const nextInstances = { ...documentComponents.instances };
            const nextOverrides = { ...documentComponents.instanceOverrides };
            delete nextInstances[instanceId];
            delete nextOverrides[instanceId];

            return {
                ...state,
                document: {
                    ...state.document,
                    components: {
                        ...documentComponents,
                        instances: nextInstances,
                        instanceOverrides: nextOverrides,
                    },
                },
            };
        }

        case EventTypes.COMPONENT_SET_ACTIVE: {
            const { componentId } = event.payload || {};
            if (!componentId) return state;

            return {
                ...state,
                activeComponentId: componentId,
            };
        }

        default:
            return state;
    }
}
