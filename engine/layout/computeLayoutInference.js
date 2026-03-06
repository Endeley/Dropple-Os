import { detectStacks } from './detectStacks.js';
import { detectRows } from './detectRows.js';
import { detectColumns } from './detectColumns.js';
import { detectGrids } from './detectGrids.js';

export function computeLayoutInference({ guides = [], nodesById = {} } = {}) {
  const layouts = [
    ...detectStacks(guides),
    ...detectRows(guides),
    ...detectColumns(guides),
    ...detectGrids(guides),
  ];

  const withBounds = layouts.map((layout) => ({
    ...layout,
    bounds: computeBoundsForNodes(layout.nodes, nodesById),
  }));

  return withBounds.sort((a, b) => {
    const la = String(a.layout ?? '');
    const lb = String(b.layout ?? '');
    if (la !== lb) return la.localeCompare(lb);
    const na = (a.nodes || []).join(',');
    const nb = (b.nodes || []).join(',');
    return na.localeCompare(nb);
  });
}

function computeBoundsForNodes(nodeIds = [], nodesById = {}) {
  if (!Array.isArray(nodeIds) || nodeIds.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodeIds.forEach((id) => {
    const node = nodesById[id];
    if (!node) return;
    const layout = node.layout || {};
    const x = layout.x ?? node.x ?? 0;
    const y = layout.y ?? node.y ?? 0;
    const w = layout.width ?? node.width ?? 0;
    const h = layout.height ?? node.height ?? 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  });

  if (!Number.isFinite(minX)) return null;

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
