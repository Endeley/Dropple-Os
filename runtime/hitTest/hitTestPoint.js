import { queryPoint } from '@/runtime/spatial/index.js';
import { filterVisibleNodes } from './filterVisibleNodes.js';
import { resolveTopNode } from './resolveTopNode.js';

export function hitTestPoint({ runtime, x, y }) {
    const spatial = runtime?.scene?.spatialIndex;
    if (!spatial) return null;

    const candidates = queryPoint(spatial, x, y);
    const visible = filterVisibleNodes(runtime, candidates);

    return resolveTopNode(runtime, visible);
}
