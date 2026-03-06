import { roundWorld } from '@/core/math/pixelRounding.js';

function getLayout(node) {
  const layout = node?.layout || {};
  return {
    x: layout.x ?? node?.x ?? 0,
    y: layout.y ?? node?.y ?? 0,
    width: layout.width ?? node?.width ?? 0,
    height: layout.height ?? node?.height ?? 0,
  };
}

function stableNodeId(node) {
  return String(node?.id ?? '');
}

function clusterValues(values, tolerance) {
  if (!values.length) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const clusters = [];
  let current = [sorted[0]];

  for (let i = 1; i < sorted.length; i += 1) {
    const v = sorted[i];
    const prev = current[current.length - 1];
    if (Math.abs(v - prev) <= tolerance) {
      current.push(v);
    } else {
      clusters.push(current);
      current = [v];
    }
  }
  clusters.push(current);

  return clusters.map((items) => {
    const avg = items.reduce((sum, val) => sum + val, 0) / items.length;
    return roundWorld(avg);
  });
}

export function computeGridPatterns({ nodes = [], tolerance = 2 } = {}) {
  if (!Array.isArray(nodes) || nodes.length < 4) return [];

  const ordered = [...nodes].sort((a, b) => stableNodeId(a).localeCompare(stableNodeId(b)));

  const centers = ordered.map((node) => {
    const layout = getLayout(node);
    return {
      id: node.id,
      cx: layout.x + layout.width / 2,
      cy: layout.y + layout.height / 2,
    };
  });

  const xs = centers.map((c) => c.cx);
  const ys = centers.map((c) => c.cy);

  const columns = clusterValues(xs, tolerance);
  const rows = clusterValues(ys, tolerance);

  if (columns.length < 2 || rows.length < 2) return [];

  const cellKey = (r, c) => `${r}:${c}`;
  const occupied = new Set();

  centers.forEach((c) => {
    const colIndex = nearestIndex(columns, c.cx);
    const rowIndex = nearestIndex(rows, c.cy);
    occupied.add(cellKey(rowIndex, colIndex));
  });

  const expected = rows.length * columns.length;
  if (occupied.size !== expected || expected !== centers.length) {
    return [];
  }

  return [
    {
      type: 'gridPattern',
      rows: rows.length,
      columns: columns.length,
      nodes: ordered.map((n) => n.id),
      rowCenters: rows,
      columnCenters: columns,
    },
  ];
}

function nearestIndex(values, target) {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < values.length; i += 1) {
    const dist = Math.abs(values[i] - target);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}
