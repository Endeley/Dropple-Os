import { loadPlugin } from './pluginLoader.js';

const loaded = new Set();

export async function startPluginHost(plugins = [], runtimeProjection) {
    const installed = [];

    for (const plugin of plugins) {
        if (!plugin?.id) {
            throw new Error('Plugin descriptor requires id');
        }

        if (loaded.has(plugin.id)) {
            continue;
        }

        const installedPlugin = await loadPlugin(plugin.module, runtimeProjection);
        loaded.add(plugin.id);
        installed.push(installedPlugin);
    }

    return installed;
}

export function clearPluginHost() {
    loaded.clear();
}
