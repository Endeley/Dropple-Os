import { hashRuntimeState } from '@/core/persistence/hashDocument.js';

export function hashSimulationState(simulationState) {
    return hashRuntimeState(simulationState ?? {});
}
