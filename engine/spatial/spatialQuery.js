function stableNodeId(node) {
  return String(node?.id ?? '');
}

export function queryNearby(grid, bounds, cellSize = 200) {
  if (!grid || !bounds) return [];

  const results = new Map();

  const minCellX = Math.floor(bounds.minX / cellSize);
  const maxCellX = Math.floor(bounds.maxX / cellSize);
  const minCellY = Math.floor(bounds.minY / cellSize);
  const maxCellY = Math.floor(bounds.maxY / cellSize);

  for (let x = minCellX; x <= maxCellX; x += 1) {
    for (let y = minCellY; y <= maxCellY; y += 1) {
      const key = `${x},${y}`;
      const cell = grid.get(key);
      if (!cell) continue;
      for (const node of cell) {
        const id = stableNodeId(node);
        if (!results.has(id)) results.set(id, node);
      }
    }
  }

  return [...results.values()].sort((a, b) =>
    stableNodeId(a).localeCompare(stableNodeId(b))
  );
}
