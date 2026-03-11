import { getSelectionNodes } from './getSelectionNodes.js';
import { unionBounds } from './unionBounds.js';

export function computeSelectionBounds(runtime) {
    const nodes = getSelectionNodes(runtime);

    if (!nodes.length) return null;

    const bounds = nodes
        .map((node) => node?.worldBounds ?? null)
        .filter(Boolean);

    return unionBounds(bounds);
}
