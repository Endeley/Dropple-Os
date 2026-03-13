import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

function deepFreezeSnapshot(value) {
    if (typeof structuredClone === 'function') {
        value = structuredClone(value);
    } else {
        value = JSON.parse(JSON.stringify(value));
    }

    if (!value || typeof value !== 'object') {
        return value;
    }

    Object.freeze(value);
    for (const key of Object.keys(value)) {
        const child = value[key];
        if (child && typeof child === 'object' && !Object.isFrozen(child)) {
            deepFreezeSnapshot(child);
        }
    }

    return value;
}

export function createPluginSandbox(runtimeProjection = () => ({})) {
    return Object.freeze({
        async dispatchEvent(event, { dispatcher } = {}) {
            const activeDispatcher = dispatcher || getRuntimeDispatcher();
            return activeDispatcher.dispatch(event);
        },

        readProjection() {
            return deepFreezeSnapshot(runtimeProjection());
        },
    });
}
