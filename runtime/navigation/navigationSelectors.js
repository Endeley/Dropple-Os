export function getCurrentScreen(runtimeState, graphId) {
    return runtimeState?.navigation?.[graphId]?.current ?? null;
}

export function getNavigationState(runtimeState, graphId) {
    return runtimeState?.navigation?.[graphId] ?? null;
}
