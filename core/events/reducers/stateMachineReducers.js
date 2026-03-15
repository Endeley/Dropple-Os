import { EventTypes } from '../eventTypes.js';

function ensureStateMachineDocument(state) {
    if (state?.document?.stateMachines) return state;

    return {
        ...state,
        document: {
            ...state.document,
            stateMachines: {
                machines: {},
                activeMachineId: null,
            },
        },
    };
}

function updateStateMachineDocument(state, patch) {
    return {
        ...state,
        document: {
            ...state.document,
            stateMachines: {
                ...state.document.stateMachines,
                ...patch,
            },
        },
    };
}

function cloneStateMachine(machine) {
    return {
        ...machine,
        states: Array.isArray(machine?.states) ? machine.states.map((state) => ({ ...state })) : [],
        transitions: Array.isArray(machine?.transitions)
            ? machine.transitions.map((transition) => ({ ...transition }))
            : [],
        parameters:
            machine?.parameters && typeof machine.parameters === 'object'
                ? { ...machine.parameters }
                : {},
        layers: Array.isArray(machine?.layers) ? machine.layers.map((layer) => ({ ...layer })) : [],
    };
}

export function stateMachineReducers(state, event) {
    const { type, payload } = event;

    if (
        type === EventTypes.STATE_MACHINE_CREATE ||
        type === EventTypes.STATE_MACHINE_UPDATE ||
        type === EventTypes.STATE_MACHINE_DELETE ||
        type === EventTypes.STATE_MACHINE_SET_ACTIVE ||
        type === EventTypes.STATE_MACHINE_PARAMETER_SET
    ) {
        const ensured = ensureStateMachineDocument(state);
        const stateMachineState = ensured.document.stateMachines;
        const machines = stateMachineState.machines || {};

        switch (type) {
            case EventTypes.STATE_MACHINE_CREATE: {
                const machine = payload?.machine;
                if (!machine?.id || machines[machine.id]) return state;

                return updateStateMachineDocument(ensured, {
                    machines: {
                        ...machines,
                        [machine.id]: cloneStateMachine(machine),
                    },
                    activeMachineId: stateMachineState.activeMachineId ?? machine.id,
                });
            }

            case EventTypes.STATE_MACHINE_UPDATE: {
                const machineId = payload?.machineId;
                const patch = payload?.patch;
                if (!machineId || !patch || !machines[machineId]) return state;

                return updateStateMachineDocument(ensured, {
                    machines: {
                        ...machines,
                        [machineId]: {
                            ...machines[machineId],
                            ...patch,
                        },
                    },
                });
            }

            case EventTypes.STATE_MACHINE_DELETE: {
                const machineId = payload?.machineId;
                if (!machineId || !machines[machineId]) return state;

                const nextMachines = { ...machines };
                delete nextMachines[machineId];

                return updateStateMachineDocument(ensured, {
                    machines: nextMachines,
                    activeMachineId:
                        stateMachineState.activeMachineId === machineId
                            ? null
                            : stateMachineState.activeMachineId,
                });
            }

            case EventTypes.STATE_MACHINE_SET_ACTIVE: {
                const machineId = payload?.machineId;
                if (machineId != null && !machines[machineId]) return state;

                return updateStateMachineDocument(ensured, {
                    activeMachineId: machineId ?? null,
                });
            }

            case EventTypes.STATE_MACHINE_PARAMETER_SET: {
                const machineId = payload?.machineId;
                const name = payload?.name;
                const value = payload?.value;
                const machine = machines[machineId];
                if (!machineId || !name || !machine) return state;

                return updateStateMachineDocument(ensured, {
                    machines: {
                        ...machines,
                        [machineId]: {
                            ...machine,
                            parameters: {
                                ...(machine.parameters || {}),
                                [name]: value,
                            },
                        },
                    },
                });
            }

            default:
                break;
        }
    }

    if (type !== EventTypes.STATE_MACHINE_TRANSITION) {
        return state;
    }

    const { machineId, target } = payload || {};
    const current = state?.stateMachines?.[machineId];

    if (!machineId || !target || current === undefined) {
        return state;
    }

    return {
        ...state,
        stateMachines: {
            ...(state.stateMachines || {}),
            [machineId]: target,
        },
    };
}
