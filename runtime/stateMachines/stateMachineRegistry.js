const registry = new Map();

function cloneParameterMap(parameters) {
    return parameters && typeof parameters === 'object' ? { ...parameters } : {};
}

export function createStateMachine({
    id,
    label = '',
    entryState = null,
    states = [],
    transitions = [],
    parameters = {},
    layers = [],
} = {}) {
    if (!id) return null;

    const normalizedStates = Array.isArray(states) ? states.map((state) => ({ ...state })) : [];
    const normalizedEntryState = entryState ?? normalizedStates[0]?.id ?? null;

    return {
        id,
        label,
        entryState: normalizedEntryState,
        states: normalizedStates,
        transitions: Array.isArray(transitions)
            ? transitions.map((transition) => ({ ...transition }))
            : [],
        parameters: cloneParameterMap(parameters),
        layers: Array.isArray(layers) ? layers.map((layer) => ({ ...layer })) : [],
    };
}

export function createStateMachineState({
    id,
    label = '',
    animationRef = null,
    blendDuration = 0.2,
    meta = null,
} = {}) {
    if (!id) return null;

    return {
        id,
        label,
        animationRef,
        blendDuration,
        meta: meta && typeof meta === 'object' ? { ...meta } : {},
    };
}

export function createStateMachineTransition({
    id,
    from,
    to,
    condition = null,
    blendDuration = 0.2,
} = {}) {
    if (!id || !from || !to) return null;

    return {
        id,
        from,
        to,
        condition:
            condition && typeof condition === 'object'
                ? { ...condition }
                : condition,
        blendDuration,
    };
}

export function registerStateMachine(machine) {
    if (!machine?.id) {
        throw new Error('State machine requires id');
    }

    registry.set(machine.id, machine);
}

export function getStateMachine(id) {
    return registry.get(id);
}

export function getAllStateMachines() {
    return Array.from(registry.values());
}

export function clearStateMachines() {
    registry.clear();
}
