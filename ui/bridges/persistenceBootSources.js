export function assertExclusiveInitialBootSources({
    initialEnvironmentDescriptor = null,
    initialRuntimeSnapshot = null,
    initialEvents = [],
    initialCursorIndex = -1,
}) {
    const hasInitialEnvironmentDescriptor =
        initialEnvironmentDescriptor && typeof initialEnvironmentDescriptor === 'object';
    const hasInitialRuntimeSnapshot =
        initialRuntimeSnapshot && typeof initialRuntimeSnapshot === 'object';
    const hasInitialEvents = Array.isArray(initialEvents) && initialEvents.length > 0;
    const hasExplicitCursor = typeof initialCursorIndex === 'number' && initialCursorIndex >= 0;

    if (
        hasInitialEnvironmentDescriptor &&
        (hasInitialRuntimeSnapshot || hasInitialEvents || hasExplicitCursor)
    ) {
        throw new Error('PersistenceBridge: cannot boot from both descriptor and snapshot sources');
    }

    return {
        hasInitialEnvironmentDescriptor,
        hasInitialRuntimeSnapshot,
        hasInitialEvents,
        hasExplicitCursor,
    };
}
