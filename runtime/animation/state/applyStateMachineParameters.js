function getDocumentStateMachines(document) {
    const stateMachines = document?.stateMachines;

    if (!stateMachines || typeof stateMachines !== 'object') {
        return {};
    }

    if (Array.isArray(stateMachines)) {
        const result = {};

        for (const machine of stateMachines) {
            const machineId = machine?.id ?? null;
            if (!machineId) continue;
            result[machineId] = machine;
        }

        return result;
    }

    if (stateMachines?.machines && typeof stateMachines.machines === 'object') {
        return stateMachines.machines;
    }

    return stateMachines;
}

function getRuntimeMachineState(runtimeMachines, machineId) {
    const entry = runtimeMachines?.[machineId];

    if (typeof entry === 'string') {
        return {
            current: entry,
        };
    }

    return entry && typeof entry === 'object' ? entry : null;
}

function getActiveStateId(runtimeMachine) {
    return runtimeMachine?.current ?? runtimeMachine?.activeState ?? runtimeMachine?.value ?? null;
}

function findState(machine, activeStateId) {
    const states = machine?.states;

    if (Array.isArray(states)) {
        return states.find((state) => state?.id === activeStateId) ?? null;
    }

    if (states && typeof states === 'object') {
        return states[activeStateId] ?? null;
    }

    return null;
}

function normalizeParameterValue(value) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }

    if (value == null) return 0;

    const coerced = Number(value);
    return Number.isFinite(coerced) ? coerced : 0;
}

export function applyStateMachineParameters({
    document = {},
    runtime = {},
    frame = 0,
} = {}) {
    void frame;

    const parameters = Object.create(null);
    const machines = getDocumentStateMachines(document);
    const runtimeMachines = runtime?.stateMachines ?? {};
    const machineIds = Object.keys(machines).sort();

    for (const machineId of machineIds) {
        const machine = machines[machineId];
        const runtimeMachine = getRuntimeMachineState(runtimeMachines, machineId);

        if (!machine || !runtimeMachine) continue;

        const activeStateId = getActiveStateId(runtimeMachine);
        if (!activeStateId) continue;

        const state = findState(machine, activeStateId);
        if (!state) continue;

        const stateParameters = state?.parameters ?? state?.params ?? state?.values ?? null;
        if (!stateParameters || typeof stateParameters !== 'object') continue;

        for (const key of Object.keys(stateParameters).sort()) {
            const value = stateParameters[key];
            if (value === undefined) continue;
            parameters[key] = normalizeParameterValue(value);
        }
    }

    return parameters;
}
