const capabilities = new Map();

function normalizeCapabilityDescriptor(capability) {
    return Object.freeze({
        id: capability.id,
        tools: Object.freeze([...(capability.tools ?? [])].sort((a, b) => String(a).localeCompare(String(b)))),
        panels: Object.freeze([...(capability.panels ?? [])].sort((a, b) => String(a).localeCompare(String(b)))),
        nodes: Object.freeze([...(capability.nodes ?? [])].sort((a, b) => String(a).localeCompare(String(b)))),
        compilers: Object.freeze([...(capability.compilers ?? [])].sort((a, b) => String(a).localeCompare(String(b)))),
        exports: Object.freeze([...(capability.exports ?? [])].sort((a, b) => String(a).localeCompare(String(b)))),
        dataProviders: Object.freeze([...(capability.dataProviders ?? [])].sort((a, b) => String(a).localeCompare(String(b)))),
        workspaceFeatures: Object.freeze([...(capability.workspaceFeatures ?? [])].sort((a, b) => String(a).localeCompare(String(b)))),
        permissions: Object.freeze([...(capability.permissions ?? [])].sort((a, b) => String(a).localeCompare(String(b)))),
        runtimeServices: Object.freeze({ ...(capability.runtimeServices ?? {}) }),
        selectors: Object.freeze({ ...(capability.selectors ?? {}) }),
        compilerServices: Object.freeze({ ...(capability.compilerServices ?? {}) }),
        exportServices: Object.freeze({ ...(capability.exportServices ?? {}) }),
        metadata: Object.freeze({ ...(capability.metadata ?? {}) }),
    });
}

export function registerCapability(capability) {
    if (!capability?.id) {
        throw new Error('Capability must have id');
    }

    capabilities.set(capability.id, normalizeCapabilityDescriptor(capability));
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
