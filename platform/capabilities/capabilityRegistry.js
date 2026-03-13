const capabilities = new Map();

export function registerCapability(capability) {
    if (!capability?.id) {
        throw new Error('Capability must have id');
    }

    capabilities.set(capability.id, capability);
}

export function getCapability(id) {
    return capabilities.get(id);
}

export function getAllCapabilities() {
    return Array.from(capabilities.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, capability]) => capability);
}

export function clearCapabilityRegistry() {
    capabilities.clear();
}
