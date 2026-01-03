import { activatePlugin } from './pluginSupervisor.js';

export function createPluginRegistry() {
    const plugins = new Map();
    const disabled = new Set();

    function register(plugin) {
        if (plugins.has(plugin.id)) return;
        plugins.set(plugin.id, plugin);
    }

    function disable(id, reason) {
        disabled.add(id);
        console.error(`[Plugin ${id}] disabled: ${reason}`);
    }

    function isDisabled(id) {
        return disabled.has(id);
    }

    function activateAll({ bus, dispatcher, getState }) {
        plugins.forEach((plugin) => {
            if (isDisabled(plugin.id)) return;

            activatePlugin({
                plugin,
                bus,
                dispatcher,
                getState,
                onCrash: (id, reason) => disable(id, reason),
                onViolation: (id, reason) => disable(id, reason),
            });
        });
    }

    return {
        register,
        disable,
        isDisabled,
        plugins,
        activateAll,
    };
}
