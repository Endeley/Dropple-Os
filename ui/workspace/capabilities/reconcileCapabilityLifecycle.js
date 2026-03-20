function safeRun(fn, capability, phase, context) {
    try {
        fn?.(context);
    } catch (error) {
        console.error(`[Capability:${capability}] ${phase} failed`, error);
    }
}

export function reconcileCapabilityLifecycle({
    mountedCapabilities,
    capabilities,
    registry,
    context,
} = {}) {
    const nextCapabilities = new Set(Array.isArray(capabilities) ? capabilities : []);
    const nextMounted = new Set(mountedCapabilities instanceof Set ? mountedCapabilities : []);

    for (const capability of nextCapabilities) {
        if (nextMounted.has(capability)) continue;

        safeRun(registry?.[capability]?.lifecycle?.onMount, capability, 'mount', context);
        nextMounted.add(capability);
    }

    for (const capability of nextMounted) {
        if (nextCapabilities.has(capability)) continue;

        safeRun(registry?.[capability]?.lifecycle?.onUnmount, capability, 'unmount', context);
        nextMounted.delete(capability);
    }

    return nextMounted;
}

export function cleanupCapabilityLifecycle({
    mountedCapabilities,
    registry,
    context,
} = {}) {
    const currentMounted = mountedCapabilities instanceof Set ? mountedCapabilities : new Set();

    for (const capability of currentMounted) {
        safeRun(registry?.[capability]?.lifecycle?.onUnmount, capability, 'unmount', context);
    }

    return new Set();
}
