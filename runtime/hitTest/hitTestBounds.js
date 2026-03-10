import { queryBounds } from '@/runtime/spatial/index.js';
import { filterVisibleNodes } from './filterVisibleNodes.js';

export function hitTestBounds({ runtime, rect }) {
    const spatial = runtime?.scene?.spatialIndex;
    if (!spatial) return [];

    const candidates = queryBounds(spatial, rect);
    return filterVisibleNodes(runtime, candidates);
}
