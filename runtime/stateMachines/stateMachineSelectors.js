export function getMachineState(runtimeState, machineId) {
    return runtimeState?.stateMachines?.[machineId];
}
