import { resolveTransitions } from './resolveTransitions.js';

export function evaluateStateMachine(machine, {
    activeStateId = machine?.entryState ?? null,
    parameters = machine?.parameters ?? {},
} = {}) {
    if (!machine) {
        return {
            activeStateId: null,
            activeState: null,
            nextTransition: null,
            activeClips: [],
        };
    }

    const states = Array.isArray(machine.states) ? machine.states : [];
    const currentState =
        states.find((state) => state.id === activeStateId) ??
        states.find((state) => state.id === machine.entryState) ??
        null;
    const nextTransition = resolveTransitions(machine, {
        activeStateId: currentState?.id ?? null,
        parameters,
    });
    const resolvedState =
        nextTransition?.to != null
            ? states.find((state) => state.id === nextTransition.to) ?? currentState
            : currentState;

    return {
        activeStateId: resolvedState?.id ?? null,
        activeState: resolvedState,
        nextTransition,
        activeClips: resolvedState?.animationRef
            ? [
                  {
                      clipRef: resolvedState.animationRef,
                      weight: 1,
                      source: 'state-machine',
                      stateId: resolvedState.id,
                      blendDuration:
                          nextTransition?.blendDuration ?? resolvedState?.blendDuration ?? 0,
                  },
              ]
            : [],
    };
}
