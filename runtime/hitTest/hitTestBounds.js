import { queryBounds } from '@/runtime/spatial/index.js';
import { filterCandidatesByPartitions } from './filterCandidatesByPartitions.js';
import { filterVisibleNodes } from './filterVisibleNodes.js';

export function hitTestBounds({ runtime, rect }) {
    const spatial = runtime?.scene?.spatialIndex;
    if (!spatial) return [];

    const candidates = filterCandidatesByPartitions(runtime, queryBounds(spatial, rect), {
        rect,
    });
    return filterVisibleNodes(runtime, candidates);
}
