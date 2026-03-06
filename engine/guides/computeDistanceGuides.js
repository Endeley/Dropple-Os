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

export function computeDistanceGuides({ nodes = [], axis = 'x', maxDistance = null } = {}) {
  if (!Array.isArray(nodes) || nodes.length < 2) return [];

  const ordered = [...nodes].sort((a, b) => {
    const la = getLayout(a);
    const lb = getLayout(b);
    const pa = axis === 'x' ? la.x : la.y;
    const pb = axis === 'x' ? lb.x : lb.y;
    if (pa !== pb) return pa - pb;
    return stableNodeId(a).localeCompare(stableNodeId(b));
  });

  const guides = [];

  for (let i = 0; i < ordered.length - 1; i += 1) {
    const a = ordered[i];
    const b = ordered[i + 1];
    if (!a || !b) continue;

    const la = getLayout(a);
    const lb = getLayout(b);

    const aMax = axis === 'x' ? la.x + la.width : la.y + la.height;
    const bMin = axis === 'x' ? lb.x : lb.y;
    const distance = bMin - aMax;

    if (distance < 0) continue;
    if (maxDistance != null && distance > maxDistance) continue;

    const aRangeStart = axis === 'x' ? la.y : la.x;
    const aRangeEnd = axis === 'x' ? la.y + la.height : la.x + la.width;
    const bRangeStart = axis === 'x' ? lb.y : lb.x;
    const bRangeEnd = axis === 'x' ? lb.y + lb.height : lb.x + lb.width;
    const overlapStart = Math.max(aRangeStart, bRangeStart);
    const overlapEnd = Math.min(aRangeEnd, bRangeEnd);
    const overlapCenter =
      overlapEnd > overlapStart
        ? overlapStart + (overlapEnd - overlapStart) / 2
        : aRangeStart + (aRangeEnd - aRangeStart) / 2;

    const x1 = axis === 'x' ? aMax : overlapCenter;
    const y1 = axis === 'x' ? overlapCenter : aMax;
    const x2 = axis === 'x' ? bMin : overlapCenter;
    const y2 = axis === 'x' ? overlapCenter : bMin;

    guides.push({
      type: 'distance',
      axis,
      startNodeId: a.id,
      endNodeId: b.id,
      distance: roundWorld(distance),
      x1: roundWorld(x1),
      y1: roundWorld(y1),
      x2: roundWorld(x2),
      y2: roundWorld(y2),
    });
  }

  return guides;
}
