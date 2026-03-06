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

export function computeAlignmentClusters({ nodes = [], axis = 'x', tolerance = 2 } = {}) {
  if (!Array.isArray(nodes) || nodes.length < 2) return [];

  const sorted = [...nodes].sort((a, b) => {
    const la = getLayout(a);
    const lb = getLayout(b);
    const pa = axis === 'x' ? la.x : la.y;
    const pb = axis === 'x' ? lb.x : lb.y;
    if (pa !== pb) return pa - pb;
    return stableNodeId(a).localeCompare(stableNodeId(b));
  });

  const buckets = new Map();

  sorted.forEach((node) => {
    const layout = getLayout(node);
    const edges = axis === 'x'
      ? [layout.x, layout.x + layout.width, layout.x + layout.width / 2]
      : [layout.y, layout.y + layout.height, layout.y + layout.height / 2];

    edges.forEach((edge) => {
      const key = Math.round(edge / Math.max(tolerance, 1));
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push({ id: node.id, value: edge });
    });
  });

  const clusters = [];

  for (const entries of buckets.values()) {
    if (entries.length < 2) continue;
    const nodesInCluster = entries
      .map((entry) => entry.id)
      .sort((a, b) => String(a).localeCompare(String(b)));
    const avg = entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length;
    const coordinate = roundWorld(avg);

    clusters.push({
      type: 'alignmentCluster',
      axis,
      coordinate,
      nodes: nodesInCluster,
      ...(axis === 'x' ? { x: coordinate } : { y: coordinate }),
    });
  }

  return clusters;
}
