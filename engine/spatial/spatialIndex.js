import { buildSpatialGrid } from './spatialGrid.js';
import { queryNearby } from './spatialQuery.js';

export function createSpatialIndex(nodes = [], cellSize = 200) {
  const grid = buildSpatialGrid(nodes, cellSize);

  return {
    query(bounds) {
      return queryNearby(grid, bounds, cellSize);
    },
  };
}
