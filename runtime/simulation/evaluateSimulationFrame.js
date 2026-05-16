import { buildSimulationInputs } from './buildSimulationInputs.js';
import { simulationTick } from './simulationTick.js';

export function evaluateSimulationFrame({
    document,
    runtime,
    previousSimulationState = null,
    time = 0,
    deltaTime = 0,
    spring = 24,
    damping = 9,
} = {}) {
    const simulationInputs = buildSimulationInputs({
        document,
        runtime,
        time,
        deltaTime,
    });

    return simulationTick({
        simulationInputs,
        previousSimulationState,
        spring,
        damping,
    });
}
