import { getNodes } from '@/runtime/document/documentAdapter.js';

export function groupProjection(runtime) {
    const nodes = getNodes(runtime);
    const groups = Object.values(nodes).filter((node) => node?.type === 'group');

    return Object.freeze({
        count: groups.length,
    });
}
