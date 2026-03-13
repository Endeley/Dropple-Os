const registry = new Map();

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
