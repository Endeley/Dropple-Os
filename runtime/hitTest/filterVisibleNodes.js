import { getNodes } from '@/runtime/document/documentAdapter.js';

export function filterVisibleNodes(runtime, nodeIds) {
    const documentNodes = runtime?.document?.nodes ?? null;
    const sceneGraphNodes = getNodes(runtime);

    const visible = [];

    for (const id of nodeIds || []) {
        const node = documentNodes?.[id] ?? sceneGraphNodes?.[id] ?? null;
        if (!node) continue;
        if (node.hidden === true) continue;

        visible.push(id);
    }

    return visible;
}
