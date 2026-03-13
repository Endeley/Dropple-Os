const registry = new Map();

export function registerPlugin(plugin) {
    if (!plugin?.id) {
        throw new Error('Plugin must have id');
    }

    if (registry.has(plugin.id)) {
        throw new Error(`Plugin ${plugin.id} already registered`);
    }

    registry.set(plugin.id, plugin);
}

export function getPlugin(id) {
    return registry.get(id);
}

export function getAllPlugins() {
    return Array.from(registry.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, plugin]) => plugin);
}

export function clearPluginRegistry() {
    registry.clear();
}
