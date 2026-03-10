export function evaluateNode({ nodeId, document, runtime }) {
    if (!runtime.computed) {
        runtime.computed = {};
    }

    const node = document?.sceneGraph?.nodes?.[nodeId];
    if (!node) return;

    const base = runtime.computed[nodeId] || {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    runtime.computed[nodeId] = {
        ...base,
    };
}
