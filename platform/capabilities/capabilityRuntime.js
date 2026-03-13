import { resolveWorkspaceCapabilities } from './capabilityResolver.js';

function addAll(target, values = []) {
    [...values].sort((a, b) => String(a).localeCompare(String(b))).forEach((value) => {
        target.add(value);
    });
}

function sortSet(values) {
    return new Set([...values].sort((a, b) => String(a).localeCompare(String(b))));
}

export function activateWorkspaceCapabilities(workspace) {
    const capabilities = resolveWorkspaceCapabilities(workspace);

    const active = {
        capabilities: new Set(),
        tools: new Set(),
        panels: new Set(),
        nodes: new Set(),
        compilers: new Set(),
        exports: new Set(),
        dataProviders: new Set(),
        workspaceFeatures: new Set(),
        permissions: new Set(),
    };

    for (const capability of capabilities) {
        active.capabilities.add(capability.id);
        addAll(active.tools, capability.tools);
        addAll(active.panels, capability.panels);
        addAll(active.nodes, capability.nodes);
        addAll(active.compilers, capability.compilers);
        addAll(active.exports, capability.exports);
        addAll(active.dataProviders, capability.dataProviders);
        addAll(active.workspaceFeatures, capability.workspaceFeatures);
        addAll(active.permissions, capability.permissions);
    }

    return {
        capabilities: sortSet(active.capabilities),
        tools: sortSet(active.tools),
        panels: sortSet(active.panels),
        nodes: sortSet(active.nodes),
        compilers: sortSet(active.compilers),
        exports: sortSet(active.exports),
        dataProviders: sortSet(active.dataProviders),
        workspaceFeatures: sortSet(active.workspaceFeatures),
        permissions: sortSet(active.permissions),
    };
}
