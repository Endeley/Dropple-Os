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

export function computeSymmetryAxes({ nodes = [], axis = 'vertical', tolerance = 2 } = {}) {
  if (!Array.isArray(nodes) || nodes.length < 2) return [];

  const ordered = [...nodes].sort((a, b) => stableNodeId(a).localeCompare(stableNodeId(b)));
  const centers = ordered.map((node) => {
    const layout = getLayout(node);
    return {
      id: node.id,
      cx: layout.x + layout.width / 2,
      cy: layout.y + layout.height / 2,
    };
  });

  const buckets = new Map();
  const tol = Math.max(tolerance, 1);

  for (let i = 0; i < centers.length; i += 1) {
    for (let j = i + 1; j < centers.length; j += 1) {
      const a = centers[i];
      const b = centers[j];
      const axisValue = axis === 'vertical'
        ? (a.cx + b.cx) / 2
        : (a.cy + b.cy) / 2;
      const key = Math.round(axisValue / tol);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push({ id: a.id, value: axisValue });
      buckets.get(key).push({ id: b.id, value: axisValue });
    }
  }

  const guides = [];

  for (const entries of buckets.values()) {
    const ids = Array.from(new Set(entries.map((e) => e.id))).sort((a, b) =>
      String(a).localeCompare(String(b))
    );
    if (ids.length < 2) continue;

    const avg = entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length;
    const coordinate = roundWorld(avg);

    guides.push({
      type: 'symmetryAxis',
      axis,
      coordinate,
      nodes: ids,
      ...(axis === 'vertical' ? { x: coordinate } : { y: coordinate }),
    });
  }

  return guides;
}
