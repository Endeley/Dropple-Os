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

export function computeSpacingGuides({ nodes = [], axis = 'x', tolerance = 2 } = {}) {
  if (!Array.isArray(nodes) || nodes.length < 3) return [];

  const sorted = [...nodes].sort((a, b) => {
    const la = getLayout(a);
    const lb = getLayout(b);
    const pa = axis === 'x' ? la.x : la.y;
    const pb = axis === 'x' ? lb.x : lb.y;
    if (pa !== pb) return pa - pb;
    return stableNodeId(a).localeCompare(stableNodeId(b));
  });

  const guides = [];

  for (let i = 0; i < sorted.length - 2; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const c = sorted[i + 2];
    if (!a || !b || !c) continue;

    const la = getLayout(a);
    const lb = getLayout(b);
    const lc = getLayout(c);

    const aMax = axis === 'x' ? la.x + la.width : la.y + la.height;
    const bMin = axis === 'x' ? lb.x : lb.y;
    const bMax = axis === 'x' ? lb.x + lb.width : lb.y + lb.height;
    const cMin = axis === 'x' ? lc.x : lc.y;

    const gap1 = bMin - aMax;
    const gap2 = cMin - bMax;

    if (gap1 < 0 || gap2 < 0) continue;
    if (Math.abs(gap1 - gap2) > tolerance) continue;

    const spacing = roundWorld((gap1 + gap2) / 2);

    guides.push({
      type: 'equalSpacing',
      axis,
      nodes: [a.id, b.id, c.id],
      spacing,
    });
  }

  return guides;
}
