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

export function resolveInitialEnvironmentBoot({
    initialEnvironmentDescriptor = null,
    initialResolvedTemplateEnvironment = null,
} = {}) {
    const hasDescriptor =
        initialEnvironmentDescriptor &&
        typeof initialEnvironmentDescriptor === 'object';
    const hasResolvedEnvironment =
        initialResolvedTemplateEnvironment &&
        typeof initialResolvedTemplateEnvironment === 'object';

    if (!hasDescriptor && !hasResolvedEnvironment) {
        return null;
    }

    if (!hasDescriptor) {
        return initialResolvedTemplateEnvironment;
    }

    if (!hasResolvedEnvironment) {
        throw new Error(
            'PersistenceBridge: descriptor-based environment boot requires an initialResolvedTemplateEnvironment.',
        );
    }

    const resolved = initialResolvedTemplateEnvironment;

    if (resolved?.environmentId !== initialEnvironmentDescriptor.environmentId) {
        throw new Error(
            'PersistenceBridge: resolved template environment does not match the initial environment descriptor.',
        );
    }

    return resolved;
}
