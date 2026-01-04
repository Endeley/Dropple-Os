import { createWorkerSandbox } from './workerSandbox';
import { createCapabilities } from './capabilityFactory';
import { createSecurePluginAPI } from './securePluginAPI';
import { withExecutionGuards } from './executionGuards';
import { perfStart, perfEnd } from '@/perf/perfTracker.js';

/**
 * Activates a plugin inside an isolated worker sandbox with derived capabilities only.
 */
export function activatePlugin({ plugin, bus, dispatcher, getState, onCrash, onViolation }) {
    const sandbox = createWorkerSandbox({
        pluginId: plugin.id,
        onMessage: (msg) => {
            if (msg.type === 'ERROR') {
                onCrash?.(plugin.id, msg.error);
                sandbox.terminate();
            }

            if (msg.type === 'READY') {
                const t = perfEnd(`plugin:${plugin.id}:activate`);
                if (t > 8) {
                    console.warn(`[Plugin ${plugin.id}] slow activate: ${t.toFixed(2)}ms`);
                }
            }
        },
        onError: (id, err) => {
            onCrash?.(id, err);
        },
    });

    const guards = withExecutionGuards({
        sandbox,
        pluginId: plugin.id,
        onViolation,
    });

    const capabilities = createCapabilities({
        permissions: plugin.permissions ?? [],
        bus,
        dispatcher,
        getState,
    });

    // 🔐 Wrap event emission to enforce quota
    if (capabilities.events?.emit) {
        const originalEmit = capabilities.events.emit;
        capabilities.events.emit = (event) => {
            if (!guards.trackEvent()) return;
            originalEmit(event);
        };
    }

    const api = createSecurePluginAPI(capabilities);

    perfStart(`plugin:${plugin.id}:activate`);
    sandbox.start({
        pluginCode: plugin.code, // raw source string
        api,
    });

    return {
        sandbox,
        dispose() {
            guards.clear();
            sandbox.terminate();
        },
    };
}
