import { queryPoint } from '@/runtime/spatial/index.js';
import { filterCandidatesByPartitions } from './filterCandidatesByPartitions.js';
import { filterVisibleNodes } from './filterVisibleNodes.js';
import { resolveTopNode } from './resolveTopNode.js';

export function hitTestPoint({ runtime, x, y }) {
    const spatial = runtime?.scene?.spatialIndex;
    if (!spatial) return null;

    const candidates = filterCandidatesByPartitions(runtime, queryPoint(spatial, x, y), {
        point: { x, y },
    });
    const visible = filterVisibleNodes(runtime, candidates);

    return resolveTopNode(runtime, visible);
}
