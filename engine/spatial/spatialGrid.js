import { computeBounds } from './spatialBounds.js';

function stableNodeId(node) {
  return String(node?.id ?? '');
}

export function buildSpatialGrid(nodes = [], cellSize = 200) {
  const grid = new Map();
  const ordered = Array.isArray(nodes)
    ? [...nodes].sort((a, b) => stableNodeId(a).localeCompare(stableNodeId(b)))
    : [];

  ordered.forEach((node) => {
    const bounds = computeBounds(node);
    const minCellX = Math.floor(bounds.minX / cellSize);
    const maxCellX = Math.floor(bounds.maxX / cellSize);
    const minCellY = Math.floor(bounds.minY / cellSize);
    const maxCellY = Math.floor(bounds.maxY / cellSize);

    for (let x = minCellX; x <= maxCellX; x += 1) {
      for (let y = minCellY; y <= maxCellY; y += 1) {
        const key = `${x},${y}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(node);
      }
    }
  });

  return grid;
}
