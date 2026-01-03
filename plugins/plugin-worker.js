// plugins/plugin-worker.js

// 🔐 Hard block dangerous globals
const blocked = [
    'window',
    'document',
    'fetch',
    'WebSocket',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'Date',
    'performance',
];

blocked.forEach((key) => {
    Object.defineProperty(self, key, {
        value: undefined,
        writable: false,
        configurable: false,
    });
});

// Math.random is nondeterministic — block it
Math.random = () => {
    throw new Error('Math.random is not allowed in plugin sandbox');
};

let plugin = null;
let api = null;

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    try {
        if (type === 'INIT') {
            const { pluginCode, api: injectedApi } = payload;

            api = Object.freeze(injectedApi);

            // 🔐 Evaluate plugin code in worker scope
            // NOTE: pluginCode must export default plugin object
            const module = await import(
                URL.createObjectURL(new Blob([pluginCode], { type: 'text/javascript' }))
            );

            plugin = module.default;

            if (!plugin || typeof plugin.activate !== 'function') {
                throw new Error('Invalid plugin: missing activate()');
            }

            plugin.activate(api);

            self.postMessage({ type: 'READY' });
        }

        if (type === 'EVENT') {
            plugin?.onEvent?.(payload);
        }
    } catch (err) {
        self.postMessage({
            type: 'ERROR',
            error: err.message,
        });
        throw err;
    }
};
