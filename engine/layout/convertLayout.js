import { computeSelectionBounds } from '../../domain/geometry/selectionBounds.js';
import { roundWorld } from '../../core/math/pixelRounding.js';

function getNodeRect(node) {
  const layout = node?.layout || {};
  return {
    id: node?.id,
    x: layout.x ?? node?.x ?? 0,
    y: layout.y ?? node?.y ?? 0,
    width: layout.width ?? node?.width ?? 0,
    height: layout.height ?? node?.height ?? 0,
    parentId: node?.parentId ?? null,
  };
}

function resolveCommonParent(nodes) {
  if (!nodes.length) return null;
  const parentId = nodes[0]?.parentId ?? null;
  if (!parentId) return null;
  return nodes.every((node) => node.parentId === parentId) ? parentId : null;
}

function sortNodesForLayout(nodes, layout) {
  const sorted = [...nodes];
  if (layout === 'column') {
    sorted.sort((a, b) => (a.y - b.y) || a.id.localeCompare(b.id));
  } else if (layout === 'row') {
    sorted.sort((a, b) => (a.x - b.x) || a.id.localeCompare(b.id));
  } else {
    sorted.sort((a, b) => (a.y - b.y) || (a.x - b.x) || a.id.localeCompare(b.id));
  }
  return sorted;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function computeAxisGap(sorted, axis) {
  const gaps = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const aStart = axis === 'x' ? a.x : a.y;
    const aSize = axis === 'x' ? a.width : a.height;
    const bStart = axis === 'x' ? b.x : b.y;
    const gap = bStart - (aStart + aSize);
    if (Number.isFinite(gap) && gap >= 0) gaps.push(gap);
  }
  return roundWorld(median(gaps));
}

export function convertLayout({
  layout,
  nodeIds,
  nodesById,
  containerId,
  options = {},
} = {}) {
  const ids = Array.isArray(nodeIds) ? nodeIds : [];
  if (!containerId || ids.length < 2 || !nodesById) return null;

  const nodes = ids
    .map((id) => nodesById[id])
    .filter(Boolean)
    .map(getNodeRect)
    .filter((node) => node.id);

  if (nodes.length < 2) return null;

  const kind = String(layout || '').toLowerCase();
  if (!['row', 'column', 'grid'].includes(kind)) return null;

  const bounds = computeSelectionBounds(nodes);
  const sorted = sortNodesForLayout(nodes, kind);
  const childIds = sorted.map((node) => node.id);
  const parentId = resolveCommonParent(nodes);

  const padding = Number.isFinite(options.padding) ? options.padding : 0;
  const gap = Number.isFinite(options.gap)
    ? options.gap
    : kind === 'column'
        ? computeAxisGap(sorted, 'y')
        : kind === 'row'
            ? computeAxisGap(sorted, 'x')
            : computeAxisGap(sorted, 'x') || computeAxisGap(sorted, 'y');

  const autoLayout =
    kind === 'grid'
      ? {
          type: 'grid',
          columns: Math.max(1, Number.isFinite(options.columns) ? options.columns : 3),
          rows: options.rows ?? 'auto',
          gap,
          padding,
          align: 'start',
          justify: 'start',
        }
      : {
          type: 'flex',
          direction: kind === 'column' ? 'column' : 'row',
          gap,
          padding,
          align: 'start',
          justify: 'start',
        };

  const container = {
    id: containerId,
    type: options.containerType || 'frame',
    layout: {
      x: roundWorld(bounds.minX),
      y: roundWorld(bounds.minY),
      width: roundWorld(bounds.width + padding * 2),
      height: roundWorld(bounds.height + padding * 2),
      autoLayout,
    },
  };

  return {
    container,
    parentId,
    childIds,
    bounds,
    autoLayout,
  };
}
