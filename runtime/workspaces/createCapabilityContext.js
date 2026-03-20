export function createCapabilityContext({
    dispatcher,
    workspace,
    mode,
} = {}) {
    return Object.freeze({
        dispatcher: dispatcher ?? null,
        workspace: workspace ?? null,
        mode: mode ?? null,
        getState: () => dispatcher?.getState?.(),
        dispatch: (action) => dispatcher?.dispatch?.(action),
    });
}
