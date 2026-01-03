// plugins/workerSandbox.js

/**
 * Host-side runner for plugin execution in a Worker sandbox.
 * Step 1: isolation only. Permissions/quotas wired in later steps.
 */
export function createWorkerSandbox({ pluginId, onMessage, onError }) {
    const worker = new Worker(new URL('./plugin-worker.js', import.meta.url), { type: 'module' });

    worker.onmessage = (e) => {
        onMessage?.(e.data);
    };

    worker.onerror = (err) => {
        onError?.(pluginId, err);
        worker.terminate();
    };

    function start({ pluginCode, api }) {
        worker.postMessage({
            type: 'INIT',
            payload: {
                pluginId,
                pluginCode,
                api,
            },
        });
    }

    function post(message) {
        worker.postMessage(message);
    }

    function terminate() {
        worker.terminate();
    }

    return {
        start,
        post,
        terminate,
    };
}
