import { installPlugin } from './pluginAPI.js';
import { createPluginSandbox } from './pluginSandbox.js';

export async function loadPlugin(pluginModule, runtimeProjection) {
    const sandbox = createPluginSandbox(runtimeProjection);
    const factory =
        typeof pluginModule === 'function' ? pluginModule : pluginModule?.default;

    if (typeof factory !== 'function') {
        throw new Error('Plugin module must export a factory function');
    }

    const plugin = await factory(sandbox);
    return installPlugin(plugin, sandbox);
}
